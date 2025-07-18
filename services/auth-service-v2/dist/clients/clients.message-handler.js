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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsMessageHandler = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const clients_service_1 = require("./clients.service");
const auth_service_1 = require("../auth/auth.service");
let ClientsMessageHandler = class ClientsMessageHandler {
    constructor(clientsService, authService) {
        this.clientsService = clientsService;
        this.authService = authService;
        this.logger = new common_1.Logger('ClientsMessageHandler');
        this.logger.log('ClientsMessageHandler initialized');
        this.logger.log('Registered message patterns: clients.{create,list,getById,update,delete}');
    }
    async createClient(data) {
        this.logger.log(`Received clients.create request for email: ${data.email}`);
        try {
            console.log('[DEBUG] Received clients.create with data:', JSON.stringify({
                nom: data.nom,
                prenom: data.prenom,
                email: data.email
            }));
            const tokenData = await this.authService.getUserFromToken({ token: data.token });
            if (!tokenData?.user?.agencyId) {
                throw new Error('Token invalide ou ID d\'agence manquant');
            }
            const result = await this.clientsService.create(tokenData.user.agencyId, data);
            console.log('[DEBUG] Client created successfully:', result.id);
            return result;
        }
        catch (error) {
            console.error('[ERROR] Client creation failed:', error.message);
            console.error('[ERROR] Full error details:', error);
            return {
                status: 'error',
                message: error.message || 'Erreur serveur interne',
                code: error.code || 'UNKNOWN_ERROR'
            };
        }
    }
    async listClients(data) {
        const logger = new common_1.Logger('ClientsMessageHandler');
        logger.debug(`Received clients.list message: ${JSON.stringify(data)}`);
        try {
            const { page = 1, limit = 10, search = '', type = '', statut = '', token = '' } = data;
            logger.log(`Listing clients with params: page=${page}, limit=${limit}, search=${search}, type=${type}, statut=${statut}`);
            let agencyId = null;
            if (token) {
                try {
                    const tokenData = await this.authService.getUserFromToken({ token });
                    if (tokenData?.user?.agencyId) {
                        agencyId = tokenData.user.agencyId;
                        logger.log(`Using agencyId from token: ${agencyId}`);
                    }
                    else {
                        logger.warn('Token valid but no agencyId found');
                    }
                }
                catch (tokenError) {
                    logger.warn(`Could not extract agencyId from token: ${tokenError.message}`);
                }
            }
            else {
                logger.warn('No token provided for clients.list');
            }
            const result = await this.clientsService.findAll(agencyId, page, limit, search, type, statut);
            logger.log(`Found ${result.items.length} clients`);
            return result;
        }
        catch (error) {
            logger.error(`Error in clients.list: ${error.message}`);
            logger.error(`Stack trace: ${error.stack}`);
            return {
                status: 'error',
                message: error.message || 'Erreur serveur interne',
                code: error.code || 'UNKNOWN_ERROR'
            };
        }
    }
    async getClientById(data) {
        this.logger.log(`Received clients.getById request for ID: ${data.id}`);
        try {
            console.log(`[DEBUG] Received clients.getById for client ID: ${data.id}`);
            const tokenData = await this.authService.getUserFromToken({ token: data.token });
            if (!tokenData?.user?.agencyId) {
                throw new Error('Token invalide ou ID d\'agence manquant');
            }
            const result = await this.clientsService.findById(data.id, tokenData.user.agencyId);
            console.log(`[DEBUG] Retrieved client: ${result.id}`);
            return result;
        }
        catch (error) {
            console.error('[ERROR] Client retrieval failed:', error.message);
            console.error('[ERROR] Full error details:', error);
            return {
                status: 'error',
                message: error.message || 'Erreur serveur interne',
                code: error.code || 'UNKNOWN_ERROR'
            };
        }
    }
    async updateClient(data) {
        this.logger.log(`Received clients.update request for ID: ${data.id}`);
        try {
            console.log(`[DEBUG] Received clients.update for client ID: ${data.id}`);
            const tokenData = await this.authService.getUserFromToken({ token: data.token });
            if (!tokenData?.user?.agencyId) {
                throw new Error('Token invalide ou ID d\'agence manquant');
            }
            const result = await this.clientsService.update(data.id, tokenData.user.agencyId, data);
            console.log(`[DEBUG] Updated client: ${result.id}`);
            return result;
        }
        catch (error) {
            console.error('[ERROR] Client update failed:', error.message);
            console.error('[ERROR] Full error details:', error);
            return {
                status: 'error',
                message: error.message || 'Erreur serveur interne',
                code: error.code || 'UNKNOWN_ERROR'
            };
        }
    }
    async deleteClient(data) {
        this.logger.log(`Received clients.delete request for ID: ${data.id}`);
        try {
            console.log(`[DEBUG] Received clients.delete for client ID: ${data.id}`);
            const tokenData = await this.authService.getUserFromToken({ token: data.token });
            if (!tokenData?.user?.agencyId) {
                throw new Error('Token invalide ou ID d\'agence manquant');
            }
            if (!['ADMIN', 'GESTIONNAIRE_CLIENTS'].includes(tokenData.user.role)) {
                throw new Error('Droits insuffisants pour supprimer un client');
            }
            await this.clientsService.delete(data.id, tokenData.user.agencyId);
            console.log(`[DEBUG] Deleted client: ${data.id}`);
            return { message: 'Client supprimé avec succès' };
        }
        catch (error) {
            console.error('[ERROR] Client deletion failed:', error.message);
            console.error('[ERROR] Full error details:', error);
            return {
                status: 'error',
                message: error.message || 'Erreur serveur interne',
                code: error.code || 'UNKNOWN_ERROR'
            };
        }
    }
};
exports.ClientsMessageHandler = ClientsMessageHandler;
__decorate([
    (0, microservices_1.MessagePattern)('clients.create'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsMessageHandler.prototype, "createClient", null);
__decorate([
    (0, microservices_1.MessagePattern)('clients.list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsMessageHandler.prototype, "listClients", null);
__decorate([
    (0, microservices_1.MessagePattern)('clients.getById'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsMessageHandler.prototype, "getClientById", null);
__decorate([
    (0, microservices_1.MessagePattern)('clients.update'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsMessageHandler.prototype, "updateClient", null);
__decorate([
    (0, microservices_1.MessagePattern)('clients.delete'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsMessageHandler.prototype, "deleteClient", null);
exports.ClientsMessageHandler = ClientsMessageHandler = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [clients_service_1.ClientsService,
        auth_service_1.AuthService])
], ClientsMessageHandler);
//# sourceMappingURL=clients.message-handler.js.map