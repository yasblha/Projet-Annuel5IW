import { Injectable, NestMiddleware, Optional } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AsyncLocalStorage } from 'node:async_hooks';

// Create AsyncLocalStorage for tenant context
export const tenantContext = new AsyncLocalStorage();

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private jwtService: JwtService;

  constructor(@Optional() jwtService?: JwtService) {
    // Create a new JwtService if not injected
    this.jwtService = jwtService || new JwtService({
      secret: process.env.JWT_SECRET || 'super-secret-key-v2',
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Extract JWT token from Authorization header
    const authHeader = req.headers.authorization;
    let agencyId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Verify and decode JWT token
        const decoded = this.jwtService.verify(token);
        
        // Extract agency_id from token payload
        agencyId = decoded.agency_id;
        
        // Attach agency_id to request object for controllers to use
        req['agencyId'] = agencyId;
      } catch (error) {
        // Invalid token, but we'll continue without tenant context
        console.log('Invalid JWT token in TenantMiddleware:', error.message);
      }
    }
    
    // Run the next middleware/handler within tenant context
    tenantContext.run({ agencyId }, () => {
      next();
    });
  }
}
