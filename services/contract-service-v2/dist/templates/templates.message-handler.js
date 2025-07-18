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
exports.TemplatesMessageHandler = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const templates_service_1 = require("./templates.service");
const jwt_1 = require("@nestjs/jwt");
let TemplatesMessageHandler = class TemplatesMessageHandler {
    constructor(templatesService, jwtService) {
        this.templatesService = templatesService;
        this.jwtService = jwtService;
    }
    async create(data) {
        try {
            const { createTemplateDto } = data;
            const template = await this.templatesService.create(createTemplateDto);
            return {
                status: 'success',
                data: template,
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
    async findAll() {
        try {
            const templates = await this.templatesService.findAll();
            return {
                status: 'success',
                data: templates,
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
            const template = await this.templatesService.findOne(data.id);
            return {
                status: 'success',
                data: template,
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
    async update(data) {
        try {
            if (!data.token) {
                throw new Error('Token is required');
            }
            const template = await this.templatesService.update(data.id, data.updateTemplateDto);
            return {
                status: 'success',
                data: template,
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
    async remove(data) {
        try {
            if (!data.token) {
                throw new Error('Token is required');
            }
            await this.templatesService.remove(data.id);
            return {
                status: 'success',
                message: 'Template deleted successfully',
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
exports.TemplatesMessageHandler = TemplatesMessageHandler;
__decorate([
    (0, microservices_1.MessagePattern)('templates.create'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplatesMessageHandler.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)('templates.list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemplatesMessageHandler.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)('templates.getById'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplatesMessageHandler.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)('templates.update'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplatesMessageHandler.prototype, "update", null);
__decorate([
    (0, microservices_1.MessagePattern)('templates.delete'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplatesMessageHandler.prototype, "remove", null);
exports.TemplatesMessageHandler = TemplatesMessageHandler = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService,
        jwt_1.JwtService])
], TemplatesMessageHandler);
//# sourceMappingURL=templates.message-handler.js.map