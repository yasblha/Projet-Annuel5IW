"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
const users_service_1 = require("../users/users.service");
const roles_service_1 = require("../roles/roles.service");
const mail_adapter_1 = require("../infrastructure/adapters/mail.adapter");
let AuthService = class AuthService {
    constructor(usersService, rolesService, jwtService, mailAdapter, sequelize) {
        this.usersService = usersService;
        this.rolesService = rolesService;
        this.jwtService = jwtService;
        this.mailAdapter = mailAdapter;
        this.sequelize = sequelize;
        this.MAX_LOGIN_ATTEMPTS = 5;
        this.LOCKOUT_DURATION_MINUTES = 30;
        this.PASSWORD_EXPIRY_DAYS = 60;
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        if (registerDto.role && !(await this.rolesService.isValidRole(registerDto.role))) {
            throw new common_1.BadRequestException('Invalid role');
        }
        this.validatePasswordStrength(registerDto.password);
        const agencyId = (0, uuid_1.v4)();
        const user = await this.usersService.createAdmin(agencyId, registerDto);
        if (!user) {
            throw new common_1.InternalServerErrorException('Failed to create user');
        }
        const userObj = {
            id: user && typeof user === 'object' && 'id' in user ? String(user.id) : null,
            email: user && typeof user === 'object' && 'email' in user ? String(user.email) : null,
            firstName: user && typeof user === 'object' && 'firstName' in user ? String(user.firstName) : null,
            lastName: user && typeof user === 'object' && 'lastName' in user ? String(user.lastName) : null,
            role: user && typeof user === 'object' && 'role' in user ? String(user.role) : null,
            agencyId: user && typeof user === 'object' && 'agencyId' in user ? String(user.agencyId) : null,
            status: user && typeof user === 'object' && 'status' in user ? String(user.status) : null
        };
        const token = this.generateToken(userObj);
        try {
            const dbUser = await this.usersService.findByEmail(userObj.email);
            if (!dbUser) {
                throw new Error('User not found after registration');
            }
            this.mailAdapter.sendRegistrationConfirmation(userObj.email, userObj.firstName, userObj.lastName, dbUser?.activationToken || '');
            console.log(`[INFO] Registration confirmation email sent to ${userObj.email}`);
        }
        catch (error) {
            console.error(`[ERROR] Failed to send registration confirmation email: ${error.message}`);
        }
        return {
            user: {
                id: userObj.id,
                email: userObj.email,
                role: userObj.role,
            },
            token,
        };
    }
    async login({ email, password }) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user && typeof user === 'object' && 'id' in user) {
            const isLocked = await this.isAccountLocked(String(user.id));
            if (isLocked) {
                throw new common_1.UnauthorizedException(`Account locked due to too many failed login attempts. Please try again after ${this.LOCKOUT_DURATION_MINUTES} minutes.`);
            }
        }
        if (user && typeof user === 'object' && 'status' in user && user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const isPasswordValid = user && typeof user === 'object' && 'password' in user ?
            await bcrypt.compare(password, String(user.password)) : false;
        if (!isPasswordValid) {
            if (user && typeof user === 'object' && 'id' in user) {
                await this.incrementFailedLoginAttempts(String(user.id));
            }
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user && typeof user === 'object' && 'id' in user) {
            await this.resetFailedLoginAttempts(String(user.id));
        }
        const passwordLastChanged = user && typeof user === 'object' && 'passwordLastChanged' in user ?
            new Date(String(user.passwordLastChanged)) : new Date();
        const passwordExpiryDate = new Date(passwordLastChanged);
        passwordExpiryDate.setDate(passwordExpiryDate.getDate() + this.PASSWORD_EXPIRY_DAYS);
        const isPasswordExpired = new Date() > passwordExpiryDate;
        const userObj = {
            id: user && typeof user === 'object' && 'id' in user ? String(user.id) : null,
            email: user && typeof user === 'object' && 'email' in user ? String(user.email) : null,
            firstName: user && typeof user === 'object' && 'firstName' in user ? String(user.firstName) : null,
            lastName: user && typeof user === 'object' && 'lastName' in user ? String(user.lastName) : null,
            role: user && typeof user === 'object' && 'role' in user ? String(user.role) : null,
            agencyId: user && typeof user === 'object' && 'agencyId' in user ? String(user.agencyId) : null,
            status: user && typeof user === 'object' && 'status' in user ? String(user.status) : null
        };
        const token = this.generateToken(userObj);
        return {
            user: {
                id: userObj.id,
                email: userObj.email,
                role: userObj.role,
                passwordExpired: isPasswordExpired,
            },
            token,
        };
    }
    async activateAccount(activateAccountDto) {
        const { token, password } = activateAccountDto;
        this.validatePasswordStrength(password);
        const user = await this.usersService.activateAccount(token, password);
        if (!user) {
            throw new common_1.BadRequestException('Failed to activate account');
        }
        const userObj = {
            id: user && typeof user === 'object' && 'id' in user ? String(user.id) : null,
            email: user && typeof user === 'object' && 'email' in user ? String(user.email) : null,
            firstName: user && typeof user === 'object' && 'firstName' in user ? String(user.firstName) : null,
            lastName: user && typeof user === 'object' && 'lastName' in user ? String(user.lastName) : null,
            role: user && typeof user === 'object' && 'role' in user ? String(user.role) : null,
            agencyId: user && typeof user === 'object' && 'agencyId' in user ? String(user.agencyId) : null,
            status: 'ACTIVE'
        };
        const jwtToken = this.generateToken(userObj);
        return {
            user: {
                id: userObj.id,
                email: userObj.email,
                role: userObj.role,
            },
            token: jwtToken,
        };
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        await this.usersService.generatePasswordResetToken(email);
        return { message: 'If the email exists, a password reset link has been sent' };
    }
    async resetPassword(resetPasswordDto) {
        const { token, password } = resetPasswordDto;
        this.validatePasswordStrength(password);
        await this.usersService.resetPassword(token, password);
        return { message: 'Password has been reset successfully' };
    }
    async refreshToken({ userId }) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user && typeof user === 'object' && 'status' in user && user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const userObj = {
            id: user && typeof user === 'object' && 'id' in user ? String(user.id) : null,
            email: user && typeof user === 'object' && 'email' in user ? String(user.email) : null,
            firstName: user && typeof user === 'object' && 'firstName' in user ? String(user.firstName) : null,
            lastName: user && typeof user === 'object' && 'lastName' in user ? String(user.lastName) : null,
            role: user && typeof user === 'object' && 'role' in user ? String(user.role) : null,
            agencyId: user && typeof user === 'object' && 'agencyId' in user ? String(user.agencyId) : null,
            status: user && typeof user === 'object' && 'status' in user ? String(user.status) : null
        };
        const access_token = this.generateToken(userObj);
        return {
            access_token,
            user: {
                id: userObj.id,
                email: userObj.email,
                firstName: userObj.firstName,
                lastName: userObj.lastName,
                role: userObj.role,
            }
        };
    }
    async getUserFromToken(data) {
        try {
            const payload = this.jwtService.verify(data.token);
            const user = await this.usersService.findById(payload.sub);
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            if (user && typeof user === 'object' && 'status' in user && user.status !== 'ACTIVE')
                throw new common_1.UnauthorizedException('Account is not active');
            let createdAt = null;
            let updatedAt = null;
            if (user && typeof user === 'object' && 'createdAt' in user && user.createdAt) {
                try {
                    createdAt = new Date(String(user.createdAt));
                }
                catch (e) {
                    console.error('Erreur lors de la conversion de createdAt en Date:', e);
                }
            }
            if (user && typeof user === 'object' && 'updatedAt' in user && user.updatedAt) {
                try {
                    updatedAt = new Date(String(user.updatedAt));
                }
                catch (e) {
                    console.error('Erreur lors de la conversion de updatedAt en Date:', e);
                }
            }
            return {
                user: {
                    id: user && typeof user === 'object' && 'id' in user ? String(user.id) : null,
                    email: user && typeof user === 'object' && 'email' in user ? String(user.email) : null,
                    firstName: user && typeof user === 'object' && 'firstName' in user ? String(user.firstName) : null,
                    lastName: user && typeof user === 'object' && 'lastName' in user ? String(user.lastName) : null,
                    role: user && typeof user === 'object' && 'role' in user ? String(user.role) : null,
                    agencyId: user && typeof user === 'object' && 'agencyId' in user ? String(user.agencyId) : null,
                    status: user && typeof user === 'object' && 'status' in user ? String(user.status) : null,
                    createdAt: createdAt,
                    updatedAt: updatedAt
                }
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            agencyId: user.agencyId,
        };
        return this.jwtService.sign(payload);
    }
    validatePasswordStrength(password) {
        if (password.length < 12) {
            throw new common_1.BadRequestException('Password must be at least 12 characters long');
        }
        if (!/\d/.test(password)) {
            throw new common_1.BadRequestException('Password must contain at least one digit');
        }
        if (!/[A-Z]/.test(password)) {
            throw new common_1.BadRequestException('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            throw new common_1.BadRequestException('Password must contain at least one lowercase letter');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw new common_1.BadRequestException('Password must contain at least one special character');
        }
    }
    async isAccountLocked(userId) {
        const [result] = await this.sequelize.query(`
      SELECT COUNT(*) as attempts, MAX(created_at) as last_attempt
      FROM login_attempts
      WHERE user_id = :userId AND successful = false
      AND created_at > NOW() - INTERVAL '${this.LOCKOUT_DURATION_MINUTES} minutes'
    `, {
            replacements: { userId },
            type: 'SELECT',
        });
        if (!result) {
            return false;
        }
        return result && typeof result === 'object' && 'attempts' in result ?
            parseInt(result.attempts, 10) >= this.MAX_LOGIN_ATTEMPTS : false;
    }
    async incrementFailedLoginAttempts(userId) {
        await this.sequelize.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        successful BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await this.sequelize.query(`
      INSERT INTO login_attempts (user_id, successful)
      VALUES (:userId, false);
    `, {
            replacements: { userId },
        });
    }
    async resetFailedLoginAttempts(userId) {
        await this.sequelize.query(`
      INSERT INTO login_attempts (user_id, successful)
      VALUES (:userId, true);
    `, {
            replacements: { userId },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)('SEQUELIZE')),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        roles_service_1.RolesService,
        jwt_1.JwtService,
        mail_adapter_1.MailAdapter,
        sequelize_1.Sequelize])
], AuthService);
//# sourceMappingURL=auth.service.js.map