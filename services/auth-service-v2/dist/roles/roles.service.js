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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("sequelize");
let RolesService = class RolesService {
    constructor(sequelize) {
        this.sequelize = sequelize;
        this.availableRoles = ['ADMIN', 'USER', 'MANAGER'];
    }
    async getAllRoles() {
        const roles = await this.sequelize.query(`
      SELECT id, name, description
      FROM roles;
    `, {
            type: 'SELECT',
        });
        return roles;
    }
    async isValidRole(role) {
        return this.availableRoles.includes(role);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SEQUELIZE')),
    __metadata("design:paramtypes", [sequelize_1.Sequelize])
], RolesService);
//# sourceMappingURL=roles.service.js.map