import { JwtService } from '@nestjs/jwt';

export class JwtUtils {
  static extractAgencyId(token: string, jwtService: JwtService): string {
    try {
      const payload = jwtService.decode(token);
      if (!payload || !payload['agencyId']) {
        throw new Error('Invalid token or missing agencyId');
      }
      return payload['agencyId'];
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
