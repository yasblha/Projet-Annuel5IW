import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsersService } from '../users/users.service';
export declare class AuthMessageHandler {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(data: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
        };
        token: string;
    } | {
        status: string;
        message: any;
        code: any;
    }>;
    login(data: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
            passwordExpired: boolean;
        };
        token: string;
    } | {
        status: string;
        message: any;
        code: any;
    }>;
    refreshToken(data: RefreshTokenDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
    }>;
    activateAccount(data: ActivateAccountDto): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
        };
        token: string;
    }>;
    forgotPassword(data: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(data: ResetPasswordDto): Promise<{
        message: string;
    }>;
    me(data: {
        token: string;
    }): Promise<import("./interfaces/token-user.interface").TokenUser>;
    logout(data: {
        token: string;
    }): Promise<{
        message: string;
    }>;
    getUsersList(data: {
        token: string;
        page?: number;
        limit?: number;
        role?: string;
        status?: string;
        search?: string;
    }): Promise<{
        users: any[] | [unknown[], unknown];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getUserById(data: {
        id: string;
        token: string;
    }): Promise<{
        user: unknown[];
    }>;
    updateUser(data: {
        id: string;
        token: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
        status?: string;
    }): Promise<unknown[]>;
    inviteUser(data: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        token: string;
    }): Promise<{
        message: string;
        user: {
            id: unknown;
            email: unknown;
            role: unknown;
            status: unknown;
        };
    }>;
    deleteUser(data: {
        id: string;
        token: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
