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
exports.TenantMiddleware = exports.tenantContext = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const node_async_hooks_1 = require("node:async_hooks");
exports.tenantContext = new node_async_hooks_1.AsyncLocalStorage();
let TenantMiddleware = class TenantMiddleware {
    constructor(jwtService) {
        this.jwtService = jwtService || new jwt_1.JwtService({
            secret: process.env.JWT_SECRET || 'super-secret-key-v2',
        });
    }
    use(req, res, next) {
        const authHeader = req.headers.authorization;
        let agencyId = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = this.jwtService.verify(token);
                agencyId = decoded.agency_id;
                req['agencyId'] = agencyId;
            }
            catch (error) {
                console.log('Invalid JWT token in TenantMiddleware:', error.message);
            }
        }
        exports.tenantContext.run({ agencyId }, () => {
            next();
        });
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map