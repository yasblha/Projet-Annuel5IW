import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    // Si c'est une requête HTTP
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const auth = request.headers['authorization'] as string | undefined;
      if (!auth) throw new UnauthorizedException('Missing authorization header');
      const [type, token] = auth.split(' ');
      if (type !== 'Bearer' || !token) throw new UnauthorizedException('Invalid token');
      try {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'secret-key' });
        request.user = payload;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid token');
      }
    }
    // Si c'est un appel microservice (RabbitMQ, TCP, etc.), on laisse passer
    return true;

  }
}

