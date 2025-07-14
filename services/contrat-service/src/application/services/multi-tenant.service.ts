import { Injectable } from '@nestjs/common';

/**
 * Service pour gérer les aspects multi-tenant des données
 * Ce service permet d'enrichir les données avec les informations du tenant
 */
@Injectable()
export class MultiTenantService {
  /**
   * Ajoute le tenantId aux données fournies
   * @param data Les données à enrichir
   * @param tenantId L'identifiant du tenant à ajouter
   * @returns Les données enrichies avec le tenantId
   */
  addTenantToData<T>(data: T, tenantId: string): T & { tenantId: string } {
    return {
      ...data,
      tenantId
    };
  }

  /**
   * Filtre les données pour ne retourner que celles appartenant au tenant spécifié
   * @param data Liste de données à filtrer
   * @param tenantId Identifiant du tenant
   * @returns Liste filtrée ne contenant que les données du tenant
   */
  filterByTenant<T extends { tenantId?: string }>(data: T[], tenantId: string): T[] {
    if (!data || !Array.isArray(data)) return [];
    return data.filter(item => item.tenantId === tenantId);
  }
}
