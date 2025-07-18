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
exports.ContractsMessageHandler = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_service_1 = require("./contracts.service");
const jwt_1 = require("@nestjs/jwt");
let ContractsMessageHandler = class ContractsMessageHandler {
    constructor(contractsService, jwtService) {
        this.contractsService = contractsService;
        this.jwtService = jwtService;
    }
    extractAgencyId(token) {
        try {
            const payload = this.jwtService.decode(token);
            return payload['agencyId'];
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    async create(data) {
        try {
            const { createContractDto } = data;
            if (!createContractDto.token) {
                throw new Error('Token is required');
            }
            const agencyId = this.extractAgencyId(createContractDto.token);
            const contract = await this.contractsService.create(agencyId, createContractDto);
            return {
                status: 'success',
                data: contract,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
            };
        }
    }
    async findAll(data) {
        try {
            const { token, filters } = data;
            if (!token) {
                throw new Error('Token is required');
            }
            const agencyId = this.extractAgencyId(token);
            const contracts = await this.contractsService.findAll(agencyId, filters);
            return {
                status: 'success',
                data: contracts,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
            };
        }
    }
    async findOne(data) {
        try {
            const { id, token } = data;
            if (!token) {
                throw new Error('Token is required');
            }
            const agencyId = this.extractAgencyId(token);
            const contract = await this.contractsService.findOne(id, agencyId);
            return {
                status: 'success',
                data: contract,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
            };
        }
    }
    async validate(data) {
        try {
            const { id, validateContractDto } = data;
            if (!validateContractDto.token) {
                throw new Error('Token is required');
            }
            const agencyId = this.extractAgencyId(validateContractDto.token);
            const contract = await this.contractsService.validate(id, agencyId);
            return {
                status: 'success',
                data: contract,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
            };
        }
    }
    async sign(data) {
        try {
            const { id, token } = data;
            if (!token) {
                throw new Error('Token is required');
            }
            const agencyId = this.extractAgencyId(token);
            const contract = await this.contractsService.sign(id, agencyId);
            return {
                status: 'success',
                data: contract,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
            };
        }
    }
    async terminate(data) {
        try {
            const { id, token, reason } = data;
            if (!token) {
                throw new Error('Token is required');
            }
            const agencyId = this.extractAgencyId(token);
            const contract = await this.contractsService.terminate(id, agencyId, reason);
            return {
                status: 'success',
                data: contract,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
            };
        }
    }
    async updateMeter(data) {
        try {
            const { contractId, meterId } = data;
            const contract = await this.contractsService.updateMeter(contractId, meterId);
            return {
                status: 'success',
                data: contract,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
            };
        }
    }
};
exports.ContractsMessageHandler = ContractsMessageHandler;
__decorate([
    (0, microservices_1.MessagePattern)('contracts.create'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsMessageHandler.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)('contracts.list'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsMessageHandler.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)('contracts.getById'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsMessageHandler.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)('contracts.validate'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsMessageHandler.prototype, "validate", null);
__decorate([
    (0, microservices_1.MessagePattern)('contracts.sign'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsMessageHandler.prototype, "sign", null);
__decorate([
    (0, microservices_1.MessagePattern)('contracts.terminate'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsMessageHandler.prototype, "terminate", null);
__decorate([
    (0, microservices_1.MessagePattern)('contracts.updateMeter'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsMessageHandler.prototype, "updateMeter", null);
exports.ContractsMessageHandler = ContractsMessageHandler = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService,
        jwt_1.JwtService])
], ContractsMessageHandler);
//# sourceMappingURL=contracts.message-handler.js.map