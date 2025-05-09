import { Sequelize } from 'sequelize';
export declare const sequelize: Sequelize;
declare const models: Record<string, any>;
export declare const initDatabase: () => Promise<void>;
export { models };
