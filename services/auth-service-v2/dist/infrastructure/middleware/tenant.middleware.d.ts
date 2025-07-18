import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AsyncLocalStorage } from 'node:async_hooks';
export declare const tenantContext: AsyncLocalStorage<unknown>;
export declare class TenantMiddleware implements NestMiddleware {
    private jwtService;
    constructor(jwtService?: JwtService);
    use(req: Request, res: Response, next: NextFunction): void;
}
