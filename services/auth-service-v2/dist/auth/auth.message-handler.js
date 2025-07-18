"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMessageHandler = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const activate_account_dto_1 = require("./dto/activate-account.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const users_service_1 = require("../users/users.service");
let AuthMessageHandler = class AuthMessageHandler {
    constructor(authService, usersService) {
        this.authService = authService;
        this.usersService = usersService;
    }
    async register(data) {
        console.log('[DEBUG] Received register request with data:', JSON.stringify({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role
        }));
        try {
            const result = await this.authService.register(data);
            console.log('[DEBUG] Registration successful for user:', data.email);
            return result;
        }
        catch (error) {
            console.error('[ERROR] Registration failed:', error.message);
            console.error('[ERROR] Full error details:', error);
            return {
                status: 'error',
                message: error.message || 'Internal server error',
                code: error.code || 'UNKNOWN_ERROR'
            };
        }
    }
    async login(data) {
        console.log('[DEBUG] Received login request with data:', JSON.stringify({ email: data.email }));
        try {
            const result = await this.authService.login(data);
            console.log('[DEBUG] Login successful for user:', data.email);
            return result;
        }
        catch (error) {
            console.error('[ERROR] Login failed:', error.message);
            console.error('[ERROR] Full error details:', error);
            return {
                status: 'error',
                message: error.message || 'Internal server error',
                code: error.code || 'UNKNOWN_ERROR'
            };
        }
    }
    async refreshToken(data) {
        return this.authService.refreshToken(data);
    }
    async activateAccount(data) {
        return this.authService.activateAccount(data);
    }
    async forgotPassword(data) {
        return this.authService.forgotPassword(data);
    }
    async resetPassword(data) {
        return this.authService.resetPassword(data);
    }
    async me(data) {
        return this.authService.getUserFromToken(data);
    }
    async logout(data) {
        return { message: 'Logout successful' };
    }
    async getUsersList(data) {
        const tokenData = await this.authService.getUserFromToken({ token: data.token });
        if (!tokenData?.user?.agencyId) {
            throw new Error('Invalid user token or missing agency ID');
        }
        return this.usersService.findAll({
            page: data.page || 1,
            limit: data.limit || 10,
            role: data.role,
            status: data.status,
            search: data.search,
            agencyId: String(tokenData.user.agencyId)
        });
    }
    async getUserById(data) {
        const tokenData = await this.authService.getUserFromToken({ token: data.token });
        const user = await this.usersService.findById(data.id);
        if (user && typeof user === 'object' && 'agencyId' in user && user.agencyId !== tokenData.user.agencyId) {
            throw new Error('Unauthorized access to user data');
        }
        return { user };
    }
    async updateUser(data) {
        const tokenData = await this.authService.getUserFromToken({ token: data.token });
        const user = await this.usersService.findById(data.id);
        if (user && typeof user === 'object' && 'agencyId' in user && user.agencyId !== tokenData.user.agencyId) {
            throw new Error('Unauthorized access to user data');
        }
        const updatedUser = await this.usersService.update(data.id, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
            status: data.status
        });
        return updatedUser;
    }
    async inviteUser(data) {
        const tokenData = await this.authService.getUserFromToken({ token: data.token });
        if (!tokenData?.user?.id) {
            throw new Error('Invalid user token');
        }
        const result = await this.usersService.inviteUser(String(tokenData.user.id), {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
        });
        return result;
    }
    async deleteUser(data) {
        const tokenData = await this.authService.getUserFromToken({ token: data.token });
        if (tokenData.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin privileges required');
        }
        const user = await this.usersService.findById(data.id);
        if (user && typeof user === 'object' && 'agencyId' in user && user.agencyId !== tokenData.user.agencyId) {
            throw new Error('Unauthorized access to user data');
        }
        return await this.usersService.deleteUser(data.id);
    }
};
exports.AuthMessageHandler = AuthMessageHandler;
__decorate([
    (0, microservices_1.MessagePattern)('auth.register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "register", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "login", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.refresh'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "refreshToken", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.activate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [activate_account_dto_1.ActivateAccountDto]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "activateAccount", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.forgot-password'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "forgotPassword", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.reset-password'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "resetPassword", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.me'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "me", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "logout", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.users.list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "getUsersList", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.users.get'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "getUserById", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.users.update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "updateUser", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.invite'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "inviteUser", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.users.delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageHandler.prototype, "deleteUser", null);
exports.AuthMessageHandler = AuthMessageHandler = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService])
], AuthMessageHandler);
//# sourceMappingURL=auth.message-handler.js.map