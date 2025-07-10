import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export interface TenantContext {
  tenantId: string;
  userId?: string;
  userRole?: string;
}

@Injectable()
export class MultiTenantService {
  private readonly reflector = new Reflector();

  /**
   * Extrait le tenantId du contexte (headers, JWT, etc.)
   */
  extractTenantFromContext(context: ExecutionContext): string | null {
    const request = context.switchToHttp().getRequest();
    
    // 1. Depuis les headers
    const tenantHeader = request.headers['x-tenant-id'] || request.headers['tenant-id'];
    if (tenantHeader) {
      return tenantHeader;
    }

    // 2. Depuis le JWT token (si disponible)
    const user = request.user;
    if (user && user.tenantId) {
      return user.tenantId;
    }

    // 3. Depuis les query parameters (pour les tests)
    const tenantQuery = request.query.tenantId;
    if (tenantQuery) {
      return tenantQuery;
    }

    // 4. Depuis le body (pour certaines opérations)
    const tenantBody = request.body?.tenantId;
    if (tenantBody) {
      return tenantBody;
    }

    return null;
  }

  /**
   * Extrait le contexte complet (tenant + user)
   */
  extractContext(context: ExecutionContext): TenantContext {
    const request = context.switchToHttp().getRequest();
    const tenantId = this.extractTenantFromContext(context);
    const user = request.user;

    return {
      tenantId: tenantId || 'default',
      userId: user?.id,
      userRole: user?.role
    };
  }

  /**
   * Ajoute le filtre tenant aux conditions de recherche
   */
  addTenantFilter(where: any, tenantId: string): any {
    if (!where) {
      return { tenantId };
    }
    return { ...where, tenantId };
  }

  /**
   * Vérifie si l'utilisateur a accès au tenant
   */
  async validateTenantAccess(tenantId: string, userId?: string): Promise<boolean> {
    // Logique de validation d'accès au tenant
    // Peut inclure des vérifications de permissions, rôles, etc.
    
    if (!tenantId) {
      return false;
    }

    // Pour l'instant, on accepte tous les tenants valides
    // À étendre avec une logique de permissions plus fine
    return true;
  }

  /**
   * Applique le tenantId aux données avant sauvegarde
   */
  addTenantToData(data: any, tenantId: string): any {
    return { ...data, tenantId };
  }

  /**
   * Filtre les résultats par tenant
   */
  filterResultsByTenant<T>(results: T[], tenantId: string): T[] {
    return results.filter((item: any) => item.tenantId === tenantId);
  }

  /**
   * Vérifie si un utilisateur peut accéder à une ressource
   */
  async canAccessResource(
    resourceTenantId: string, 
    userTenantId: string, 
    userRole?: string
  ): Promise<boolean> {
    // Même tenant = accès autorisé
    if (resourceTenantId === userTenantId) {
      return true;
    }

    // Admins peuvent accéder à tous les tenants
    if (userRole === 'ADMIN') {
      return true;
    }

    // Autres rôles : pas d'accès cross-tenant
    return false;
  }

  /**
   * Génère une clause WHERE pour les requêtes avec tenant
   */
  buildTenantWhereClause(tenantId: string, additionalWhere?: any): any {
    const baseWhere = { tenantId };
    
    if (!additionalWhere) {
      return baseWhere;
    }

    return { ...baseWhere, ...additionalWhere };
  }

  /**
   * Logique de pagination avec tenant
   */
  buildPaginatedQuery(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: any;
    tenantId: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    let where: any = { tenantId: options.tenantId };

    // Ajout des filtres de recherche
    if (options.search) {
      where.numero = { $like: `%${options.search}%` };
    }

    // Ajout des filtres supplémentaires
    if (options.filters) {
      where = { ...where, ...options.filters };
    }

    return {
      where,
      offset,
      limit,
      order: [['dateCreation', 'DESC']]
    };
  }
}

/**
 * Guard pour vérifier l'accès multi-tenant
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private multiTenantService: MultiTenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tenantId = this.multiTenantService.extractTenantFromContext(context);
    
    if (!tenantId) {
      return false; // Pas de tenant = accès refusé
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    return this.multiTenantService.validateTenantAccess(tenantId, userId);
  }
} 