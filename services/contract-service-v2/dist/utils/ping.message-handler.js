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
var PingMessageHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingMessageHandler = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const jwt_1 = require("@nestjs/jwt");
let PingMessageHandler = PingMessageHandler_1 = class PingMessageHandler {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(PingMessageHandler_1.name);
    }
    async ping(data) {
        this.logger.log(`Ping reçu avec données: ${JSON.stringify(data)}`);
        const token = data === null || data === void 0 ? void 0 : data.token;
        this.logger.log(`Token dans le message: ${token ? 'Présent' : 'Absent'}`);
        let tokenInfo = null;
        if (token) {
            try {
                tokenInfo = this.jwtService.decode(token);
                this.logger.log(`Token décodé avec succès: ${JSON.stringify(tokenInfo)}`);
            }
            catch (error) {
                this.logger.error(`Erreur de décodage du token: ${error.message}`);
            }
        }
        return {
            status: 'success',
            data: {
                message: 'Contract Service V2 is alive',
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                receivedData: data,
                tokenInfo: tokenInfo
            }
        };
    }
};
exports.PingMessageHandler = PingMessageHandler;
__decorate([
    (0, microservices_1.MessagePattern)('ping'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PingMessageHandler.prototype, "ping", null);
exports.PingMessageHandler = PingMessageHandler = PingMessageHandler_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], PingMessageHandler);
//# sourceMappingURL=ping.message-handler.js.map