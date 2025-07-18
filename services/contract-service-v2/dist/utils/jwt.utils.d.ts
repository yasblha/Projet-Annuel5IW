import { JwtService } from '@nestjs/jwt';
export declare class JwtUtils {
    static extractAgencyId(token: string, jwtService: JwtService): string;
}
