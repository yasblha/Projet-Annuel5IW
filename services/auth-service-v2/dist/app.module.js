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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
const microservices_2 = require("@nestjs/microservices");
const database_module_1 = require("./config/database.module");
const tenant_middleware_1 = require("./infrastructure/middleware/tenant.middleware");
const clients_module_1 = require("./clients/clients.module");
const test_module_1 = require("./test/test.module");
let AppModule = class AppModule {
    constructor() {
        this.logger = new common_1.Logger('AppModule');
        this.logger.log('AppModule initialized');
        this.logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        this.logger.log(`RabbitMQ URL: ${process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'}`);
    }
    configure(consumer) {
        consumer
            .apply(tenant_middleware_1.TenantMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            database_module_1.DatabaseModule,
            microservices_1.ClientsModule.register([
                {
                    name: 'MAILER_SERVICE',
                    transport: microservices_2.Transport.RMQ,
                    options: {
                        urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
                        queue: 'mailer_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                },
            ]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            clients_module_1.ClientsModule,
            test_module_1.TestModule,
        ],
        providers: [common_1.Logger],
    }),
    __metadata("design:paramtypes", [])
], AppModule);
//# sourceMappingURL=app.module.js.map