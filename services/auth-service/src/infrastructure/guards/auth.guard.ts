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
  }
}

