import { ClientProxy } from '@nestjs/microservices';
import { RegisterDto } from '../auth/dto/register.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { Sequelize } from 'sequelize';
export declare class UsersService {
    private sequelize;
    private mailerClient;
    constructor(sequelize: Sequelize, mailerClient: ClientProxy);
    createAdmin(agencyId: string, registerDto: RegisterDto): Promise<unknown[]>;
    findByEmail(email: string): Promise<unknown[]>;
    findById(id: string): Promise<unknown[]>;
    inviteUser(adminId: string, inviteDto: InviteUserDto): Promise<{
        message: string;
        user: {
            id: unknown;
            email: unknown;
            role: unknown;
            status: unknown;
        };
    }>;
    activateAccount(token: string, password: string): Promise<{
        id: unknown;
        email: unknown;
        role: unknown;
        status: string;
        agencyId: unknown;
    }>;
    generatePasswordResetToken(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, password: string): Promise<{
        message: string;
        user: {
            id: unknown;
            email: unknown;
            role: unknown;
        };
    }>;
    findAllByAgency(agencyId: string): Promise<{
        id: unknown;
        email: unknown;
        firstName: unknown;
        lastName: unknown;
        role: unknown;
        status: unknown;
        agencyId: unknown;
        createdAt: unknown;
        updatedAt: unknown;
    }[]>;
    findAll({ page, limit, role, status, search, agencyId }: {
        page?: number;
        limit?: number;
        role?: string;
        status?: string;
        search?: string;
        agencyId?: string;
    }): Promise<{
        users: any[] | [unknown[], unknown];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    update(id: string, updateData: {
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
        status?: string;
    }): Promise<unknown[]>;
    deleteUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
