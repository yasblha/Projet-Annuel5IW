import { Sequelize } from 'sequelize';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './interfaces/client.interface';
export declare class ClientsService {
    private sequelize;
    constructor(sequelize: Sequelize);
    create(agencyId: string, createClientDto: CreateClientDto): Promise<Client>;
    findAll(agencyId: string | null, page?: number, limit?: number, search?: string, type?: string, statut?: string): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string, agencyId: string): Promise<Client>;
    findByEmail(email: string, agencyId: string): Promise<Client | null>;
    update(id: string, agencyId: string, updateClientDto: UpdateClientDto): Promise<Client>;
    delete(id: string, agencyId: string): Promise<void>;
    private formatClient;
}
