import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuthService } from '../auth/auth.service';
export declare class ClientsMessageHandler {
    private readonly clientsService;
    private readonly authService;
    private readonly logger;
    constructor(clientsService: ClientsService, authService: AuthService);
    createClient(data: CreateClientDto & {
        token: string;
    }): Promise<import("./interfaces/client.interface").Client | {
        status: string;
        message: any;
        code: any;
    }>;
    listClients(data: any): Promise<any>;
    getClientById(data: {
        id: string;
        token: string;
    }): Promise<import("./interfaces/client.interface").Client | {
        status: string;
        message: any;
        code: any;
    }>;
    updateClient(data: {
        id: string;
        token: string;
    } & UpdateClientDto): Promise<import("./interfaces/client.interface").Client | {
        status: string;
        message: any;
        code: any;
    }>;
    deleteClient(data: {
        id: string;
        token: string;
    }): Promise<{
        message: string;
        status?: undefined;
        code?: undefined;
    } | {
        status: string;
        message: any;
        code: any;
    }>;
}
