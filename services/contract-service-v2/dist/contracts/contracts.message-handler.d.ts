import { ContractsService } from './contracts.service';
import { CreateContractDto } from '../dto/create-contract.dto';
import { ValidateContractDto } from '../dto/validate-contract.dto';
import { JwtService } from '@nestjs/jwt';
export declare class ContractsMessageHandler {
    private readonly contractsService;
    private readonly jwtService;
    constructor(contractsService: ContractsService, jwtService: JwtService);
    private extractAgencyId;
    create(data: {
        createContractDto: CreateContractDto;
    }): Promise<{
        status: string;
        data: any;
        message?: undefined;
        code?: undefined;
    } | {
        status: string;
        message: any;
        code: any;
        data?: undefined;
    }>;
    findAll(data: {
        token: string;
        filters?: any;
    }): Promise<{
        status: string;
        data: any[];
        message?: undefined;
        code?: undefined;
    } | {
        status: string;
        message: any;
        code: any;
        data?: undefined;
    }>;
    findOne(data: {
        id: string;
        token: string;
    }): Promise<{
        status: string;
        data: any;
        message?: undefined;
        code?: undefined;
    } | {
        status: string;
        message: any;
        code: any;
        data?: undefined;
    }>;
    validate(data: {
        id: string;
        validateContractDto: ValidateContractDto;
    }): Promise<{
        status: string;
        data: any;
        message?: undefined;
        code?: undefined;
    } | {
        status: string;
        message: any;
        code: any;
        data?: undefined;
    }>;
    sign(data: {
        id: string;
        token: string;
    }): Promise<{
        status: string;
        data: any;
        message?: undefined;
        code?: undefined;
    } | {
        status: string;
        message: any;
        code: any;
        data?: undefined;
    }>;
    terminate(data: {
        id: string;
        token: string;
        reason?: string;
    }): Promise<{
        status: string;
        data: any;
        message?: undefined;
        code?: undefined;
    } | {
        status: string;
        message: any;
        code: any;
        data?: undefined;
    }>;
    updateMeter(data: {
        contractId: string;
        meterId: string;
    }): Promise<{
        status: string;
        data: any;
        message?: undefined;
        code?: undefined;
    } | {
        status: string;
        message: any;
        code: any;
        data?: undefined;
    }>;
}
