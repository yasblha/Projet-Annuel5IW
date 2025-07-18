import { Sequelize } from 'sequelize';
export declare class RolesService {
    private sequelize;
    private readonly availableRoles;
    constructor(sequelize: Sequelize);
    getAllRoles(): Promise<[unknown[], unknown]>;
    isValidRole(role: string): Promise<boolean>;
}
