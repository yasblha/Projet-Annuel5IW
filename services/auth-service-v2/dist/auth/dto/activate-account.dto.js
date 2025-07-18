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
exports.ActivateAccountDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ActivateAccountDto {
}
exports.ActivateAccountDto = ActivateAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Activation token received by email',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Activation token is required' }),
    __metadata("design:type", String)
], ActivateAccountDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password (min 12 chars, must include uppercase, lowercase, number, special char)',
        example: 'StrongP@ssw0rd123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.MinLength)(12, { message: 'Password must be at least 12 characters long' }),
    (0, class_validator_1.Matches)(/[0-9]/, { message: 'Password must contain at least one number' }),
    (0, class_validator_1.Matches)(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' }),
    (0, class_validator_1.Matches)(/[a-z]/, { message: 'Password must contain at least one lowercase letter' }),
    (0, class_validator_1.Matches)(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character' }),
    __metadata("design:type", String)
], ActivateAccountDto.prototype, "password", void 0);
//# sourceMappingURL=activate-account.dto.js.map