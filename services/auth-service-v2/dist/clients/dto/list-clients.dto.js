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
exports.ListClientsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ListClientsDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.ListClientsDto = ListClientsDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], ListClientsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], ListClientsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListClientsDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PARTICULIER', 'ENTREPRISE']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListClientsDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PROSPECT', 'ACTIF', 'SUSPENDU', 'INACTIF', 'RESILIE', 'ARCHIVE']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListClientsDto.prototype, "statut", void 0);
//# sourceMappingURL=list-clients.dto.js.map