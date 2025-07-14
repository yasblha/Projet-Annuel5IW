import { Injectable } from '@nestjs/common';

/**
 * Service pour gérer la multi-tenancy
 */
@Injectable()
export class MultiTenantService {
  /**
   * Ajoute le tenantId à un objet de données
   */
  addTenantToData<T extends Record<string, any>>(data: T, tenantId: string): T & { tenantId: string } {
    return {
      ...data,
      tenantId,
    };
  }

  /**
   * Filtrer les données par tenantId
   */
  filterByTenant<T extends { tenantId?: string }>(items: T[], tenantId: string): T[] {
    if (!items || !Array.isArray(items)) return [];
    return items.filter(item => item.tenantId === tenantId);
  }
}
