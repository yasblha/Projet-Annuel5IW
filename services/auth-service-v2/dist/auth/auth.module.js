"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const microservices_1 = require("@nestjs/microservices");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const auth_message_handler_1 = require("./auth.message-handler");
const users_module_1 = require("../users/users.module");
const jwt_strategy_1 = require("../infrastructure/guards/jwt.strategy");
const roles_module_1 = require("../roles/roles.module");
const mail_adapter_1 = require("../infrastructure/adapters/mail.adapter");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            passport_1.PassportModule,
            microservices_1.ClientsModule.register([
                {
                    name: 'MAILER_SERVICE',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
                        queue: 'mailer_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                },
            ]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'super-secret-key-v2',
                signOptions: { expiresIn: '24h' },
            }),
        ],
        controllers: [auth_controller_1.AuthController, auth_message_handler_1.AuthMessageHandler],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, mail_adapter_1.MailAdapter],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map