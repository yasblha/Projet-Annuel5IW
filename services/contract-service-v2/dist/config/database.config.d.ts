import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
export declare const getDatabaseConfig: (configService: ConfigService) => SequelizeModuleOptions;
