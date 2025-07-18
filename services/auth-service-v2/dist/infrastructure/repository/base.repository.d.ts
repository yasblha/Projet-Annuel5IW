import { Sequelize } from 'sequelize';
export declare class BaseRepository {
    protected sequelize: Sequelize;
    constructor(sequelize: Sequelize);
    whereAgency(agencyId?: string, extraConditions?: string): string;
    executeWithAgencyFilter(query: string, replacements?: any, options?: any): Promise<[undefined, number]>;
}
