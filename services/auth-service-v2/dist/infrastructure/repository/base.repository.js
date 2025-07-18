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
exports.BaseRepository = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("sequelize");
const tenant_middleware_1 = require("../middleware/tenant.middleware");
let BaseRepository = class BaseRepository {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }
    whereAgency(agencyId, extraConditions) {
        const store = tenant_middleware_1.tenantContext.getStore();
        const contextAgencyId = store && typeof store === 'object' && 'agencyId' in store ? store.agencyId : undefined;
        const finalAgencyId = agencyId || contextAgencyId;
        if (!finalAgencyId) {
            throw new Error('Agency ID is required but not provided');
        }
        if (extraConditions) {
            return `agency_id = '${finalAgencyId}' AND ${extraConditions}`;
        }
        return `agency_id = '${finalAgencyId}'`;
    }
    async executeWithAgencyFilter(query, replacements = {}, options = {}) {
        const store = tenant_middleware_1.tenantContext.getStore();
        const agencyId = store && typeof store === 'object' && 'agencyId' in store ? store.agencyId : undefined;
        if (!agencyId && !replacements.agencyId) {
            throw new Error('Agency ID is required but not provided');
        }
        if (!replacements.agencyId) {
            replacements.agencyId = agencyId;
        }
        return this.sequelize.query(query, {
            ...options,
            replacements,
        });
    }
};
exports.BaseRepository = BaseRepository;
exports.BaseRepository = BaseRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sequelize_1.Sequelize])
], BaseRepository);
//# sourceMappingURL=base.repository.js.map