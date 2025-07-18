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
exports.MailAdapter = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
let MailAdapter = class MailAdapter {
    constructor(mailerClient) {
        this.mailerClient = mailerClient;
    }
    sendInvitation(email, activationToken, role) {
        return this.mailerClient.emit('send_invitation', {
            email,
            activationToken,
            role,
            subject: 'Invitation to join our platform',
            template: 'invitation',
            data: {
                activationLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/activate?token=${activationToken}`,
                role,
            },
        });
    }
    sendPasswordReset(email, resetToken) {
        return this.mailerClient.emit('send_password_reset', {
            email,
            resetToken,
            subject: 'Password Reset Request',
            template: 'password-reset',
            data: {
                resetLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`,
            },
        });
    }
    sendPasswordExpirationNotice(email) {
        return this.mailerClient.emit('send_password_expiration', {
            email,
            subject: 'Your Password Will Expire Soon',
            template: 'password-expiration',
            data: {
                loginLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login`,
            },
        });
    }
    sendRegistrationConfirmation(email, firstName, lastName, activationToken) {
        const frontendUrl = process.env.FRONTEND_URL || 'https://app.aquaerp.cloud';
        return this.mailerClient.emit('user.registered', {
            email,
            firstname: firstName,
            token: activationToken || '',
            frontendUrl: frontendUrl,
        });
    }
};
exports.MailAdapter = MailAdapter;
exports.MailAdapter = MailAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('MAILER_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], MailAdapter);
//# sourceMappingURL=mail.adapter.js.map