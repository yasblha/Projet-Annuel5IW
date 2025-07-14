import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@Database/models/enums/userRole.enum';

/**
 * Garde pour vérifier si l'utilisateur a les rôles requis pour accéder à une ressource
 * Implémente une logique hiérarchique pour les rôles (SUPER_ADMIN > ADMIN > autres rôles)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler()
    );
    
    // Si aucun rôle n'est requis, l'accès est autorisé
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    let user;
    
    // Extraction de l'utilisateur selon le type de contexte (HTTP ou RPC)
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      user = request.user;
    } else if (context.getType() === 'rpc') {
      const data = context.switchToRpc().getData();
      user = data.user;
    }

    // Si l'utilisateur n'existe pas, l'accès est refusé
    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Vérification du rôle de l'utilisateur avec gestion de hiérarchie
    const hasPermission = this.checkRolePermission(user.role, requiredRoles);
    
    if (!hasPermission) {
      throw new ForbiddenException(`Accès refusé - Rôle requis: ${requiredRoles.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Vérifie si le rôle de l'utilisateur lui permet d'accéder à une ressource
   * Implémente une logique hiérarchique pour les rôles
   * 
   * @param userRole Le rôle de l'utilisateur
   * @param requiredRoles Les rôles requis pour accéder à la ressource
   * @returns true si l'utilisateur a l'autorisation, false sinon
   */
  private checkRolePermission(userRole: string, requiredRoles: UserRole[]): boolean {
    // SUPER_ADMIN a accès à tout
    if (userRole === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    // ADMIN a accès à tout sauf ce qui est réservé au SUPER_ADMIN
    if (userRole === UserRole.ADMIN && !requiredRoles.includes(UserRole.SUPER_ADMIN)) {
      return true;
    }

    // DIRECTEUR a accès à toutes les fonctions opérationnelles mais pas administratives
    if (userRole === UserRole.DIRECTEUR && 
        !requiredRoles.includes(UserRole.SUPER_ADMIN) && 
        !requiredRoles.includes(UserRole.ADMIN)) {
      // Vérifier si tous les rôles requis sont des rôles administratifs
      const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
      const requiresOnlyAdminRoles = requiredRoles.every(role => adminRoles.includes(role as UserRole));
      
      if (!requiresOnlyAdminRoles) {
        return true;
      }
    }
    
    // Vérification directe du rôle
    return requiredRoles.includes(userRole as UserRole);
  }
}
