import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { JwtService } from '@nestjs/jwt';
export declare class TemplatesMessageHandler {
    private readonly templatesService;
    private readonly jwtService;
    constructor(templatesService: TemplatesService, jwtService: JwtService);
    create(data: {
        createTemplateDto: CreateTemplateDto;
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
    findAll(): Promise<{
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
    update(data: {
        id: string;
        updateTemplateDto: Partial<CreateTemplateDto>;
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
    remove(data: {
        id: string;
        token: string;
    }): Promise<{
        status: string;
        message: string;
        code?: undefined;
    } | {
        status: string;
        message: any;
        code: any;
    }>;
}
