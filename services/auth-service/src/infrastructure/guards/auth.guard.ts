import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Blacklist en mémoire (à remplacer par Redis en prod)
const jwtBlacklist = new Set<string>();
export function addTokenToBlacklist(token: string) {
  jwtBlacklist.add(token);
}
export function isTokenBlacklisted(token: string): boolean {
  return jwtBlacklist.has(token);
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const auth = request.headers['authorization'] as string | undefined;
      if (!auth) throw new UnauthorizedException('Missing authorization header');
      const [type, token] = auth.split(' ');
      if (type !== 'Bearer' || !token) throw new UnauthorizedException('Invalid token');
      // Vérification blacklist
      if (isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token invalidé (déconnexion)');
      }
      try {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'secret-key' });
        request.user = payload;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid token');
      }
    } else if (context.getType() === 'rpc') {
      const data = context.switchToRpc().getData();
      // On accepte le token dans data.authorization OU data.headers.authorization
      let auth: string | undefined = data?.authorization;
      if (!auth && data?.headers) auth = data.headers.authorization;
      if (!auth) throw new UnauthorizedException('Missing authorization (RPC)');
      const [type, token] = auth.split(' ');
      if (type !== 'Bearer' || !token) throw new UnauthorizedException('Invalid token (RPC)');
      if (isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token invalidé (déconnexion)');
      }
      try {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'secret-key' });
        // On peut attacher le user au data si besoin : data.user = payload;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid token (RPC)');
      }
    }
    // Si le contexte n'est ni http ni rpc
    throw new UnauthorizedException('Unsupported context');
  }
}

