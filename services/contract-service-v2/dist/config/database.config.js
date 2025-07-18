"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (configService) => ({
    dialect: 'postgres',
    host: configService.get('DATABASE_HOST', 'postgres'),
    port: configService.get('DATABASE_PORT', 5432),
    username: configService.get('DATABASE_USERNAME', 'postgres'),
    password: configService.get('DATABASE_PASSWORD', 'postgres'),
    database: configService.get('DATABASE_NAME', 'main'),
    autoLoadModels: false,
    synchronize: false,
    logging: configService.get('NODE_ENV') === 'development' ? console.log : false,
});
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map