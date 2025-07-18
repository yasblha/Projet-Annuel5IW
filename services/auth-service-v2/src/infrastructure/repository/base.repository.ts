import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { tenantContext } from '../middleware/tenant.middleware';

@Injectable()
export class BaseRepository {
  constructor(protected sequelize: Sequelize) {}

  /**
   * Helper method to add agency_id filter to queries
   * @param agencyId - The agency ID to filter by
   * @param extraConditions - Additional WHERE conditions
   * @returns SQL WHERE clause with agency_id filter
   */
  whereAgency(agencyId?: string, extraConditions?: string): string {
    // If agencyId is not provided, try to get it from AsyncLocalStorage
    const store = tenantContext.getStore();
    const contextAgencyId = store && typeof store === 'object' && 'agencyId' in store ? store.agencyId : undefined;
    const finalAgencyId = agencyId || contextAgencyId;
    
    if (!finalAgencyId) {
      throw new Error('Agency ID is required but not provided');
    }
    
    if (extraConditions) {
      return `agency_id = '${finalAgencyId}' AND ${extraConditions}`;
    }
    
    return `agency_id = '${finalAgencyId}'`;
  }

  /**
   * Execute a query with agency_id filter
   * @param query - SQL query with :agencyId placeholder
   * @param replacements - Query parameters
   * @param options - Query options
   * @returns Query result
   */
  async executeWithAgencyFilter(query: string, replacements: any = {}, options: any = {}) {
    // Get agency_id from AsyncLocalStorage
    const store = tenantContext.getStore();
    const agencyId = store && typeof store === 'object' && 'agencyId' in store ? store.agencyId : undefined;
    
    if (!agencyId && !replacements.agencyId) {
      throw new Error('Agency ID is required but not provided');
    }
    
    // Add agency_id to replacements if not already present
    if (!replacements.agencyId) {
      replacements.agencyId = agencyId;
    }
    
    return this.sequelize.query(query, {
      ...options,
      replacements,
    });
  }
}
