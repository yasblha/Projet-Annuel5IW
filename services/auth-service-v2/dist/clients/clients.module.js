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
exports.ClientsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const clients_service_1 = require("./clients.service");
const clients_message_handler_1 = require("./clients.message-handler");
let ClientsModule = class ClientsModule {
    constructor(logger) {
        this.logger = logger;
        this.logger.log('ClientsModule constructor called');
    }
};
exports.ClientsModule = ClientsModule;
exports.ClientsModule = ClientsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
        ],
        controllers: [clients_message_handler_1.ClientsMessageHandler],
        providers: [
            clients_service_1.ClientsService,
            common_1.Logger,
            {
                provide: 'CLIENTS_LOGGER',
                useFactory: () => {
                    const logger = new common_1.Logger('ClientsModule');
                    logger.log('ClientsModule initialized');
                    return logger;
                }
            }
        ],
        exports: [clients_service_1.ClientsService],
    }),
    __metadata("design:paramtypes", [common_1.Logger])
], ClientsModule);
//# sourceMappingURL=clients.module.js.map