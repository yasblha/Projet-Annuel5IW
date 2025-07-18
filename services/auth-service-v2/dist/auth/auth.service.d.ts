import { JwtService } from '@nestjs/jwt';
import { Sequelize } from 'sequelize';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { MailAdapter } from '../infrastructure/adapters/mail.adapter';
import { TokenUser } from './interfaces/token-user.interface';
export declare class AuthService {
    private readonly usersService;
    private readonly rolesService;
    private readonly jwtService;
    private readonly mailAdapter;
    private sequelize;
    private readonly MAX_LOGIN_ATTEMPTS;
    private readonly LOCKOUT_DURATION_MINUTES;
    private readonly PASSWORD_EXPIRY_DAYS;
    constructor(usersService: UsersService, rolesService: RolesService, jwtService: JwtService, mailAdapter: MailAdapter, sequelize: Sequelize);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
        };
        token: string;
    }>;
    login({ email, password }: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
            passwordExpired: boolean;
        };
        token: string;
    }>;
    activateAccount(activateAccountDto: ActivateAccountDto): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
        };
        token: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    refreshToken({ userId }: {
        userId: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
    }>;
    getUserFromToken(data: {
        token: string;
    }): Promise<TokenUser>;
    private generateToken;
    private validatePasswordStrength;
    private isAccountLocked;
    private incrementFailedLoginAttempts;
    private resetFailedLoginAttempts;
}
