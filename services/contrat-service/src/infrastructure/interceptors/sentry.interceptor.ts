import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Pour les requêtes HTTP
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const { method, url, body, headers, ip, user } = request;

      // Ajouter des informations contextuelles à Sentry pour une meilleure traçabilité
      Sentry.configureScope((scope) => {
        scope.setExtra('method', method);
        scope.setExtra('url', url);
        scope.setExtra('body', body);
        scope.setExtra('ip', ip);

        // Ajout d'informations utilisateur si disponibles
        if (user) {
          scope.setUser({
            id: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role,
          });
        }

        // Ajout d'un tag pour le traçage des requêtes HTTP
        scope.setTag('type', 'http');
      });
    } 
    // Pour les messages microservices
    else if (context.getType() === 'rpc') {
      const rpcContext = context.switchToRpc();
      const data = rpcContext.getData();

      Sentry.configureScope((scope) => {
        scope.setExtra('pattern', rpcContext.getContext().pattern);
        scope.setExtra('data', data);
        scope.setTag('type', 'microservice');
      });
    }

    return next.handle().pipe(
      tap(null, (exception) => {
        // Capture uniquement les exceptions non gérées
        Sentry.captureException(exception);
      }),
    );
  }
}
