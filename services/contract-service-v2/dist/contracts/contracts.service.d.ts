import { Sequelize } from 'sequelize-typescript';
import { CreateContractDto } from '../dto/create-contract.dto';
export declare class ContractsService {
    private sequelize;
    constructor(sequelize: Sequelize);
    create(agencyId: string, createContractDto: CreateContractDto): Promise<any>;
    findAll(agencyId: string, filters?: any): Promise<any[]>;
    findOne(id: string, agencyId: string): Promise<any>;
    validate(id: string, agencyId: string): Promise<any>;
    sign(id: string, agencyId: string): Promise<any>;
    terminate(id: string, agencyId: string, reason?: string): Promise<any>;
    updateMeter(id: string, meterId: string): Promise<any>;
    private formatContract;
}
