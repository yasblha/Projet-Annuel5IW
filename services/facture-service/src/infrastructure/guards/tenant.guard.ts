import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Récupérer le tenantId depuis le header X-Tenant-ID
    const tenantId = request.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID requis');
    }
    
    // Ajouter le tenantId à la requête
    request['tenantId'] = tenantId;
    
    return true;
  }
}
