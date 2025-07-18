import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContractsModule } from './contracts/contracts.module';
import { TemplatesModule } from './templates/templates.module';
import { getDatabaseConfig } from './config/database.config';
import { JwtModule } from '@nestjs/jwt';
// Import the PingMessageHandler to ensure it's included as a provider
import { PingMessageHandler } from './utils/ping.message-handler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'secret'),
      }),
    }),
    ContractsModule,
    TemplatesModule,
  ],
  // Register PingMessageHandler as a controller so Nest picks up its MessagePattern handlers
  controllers: [PingMessageHandler],
})
export class AppModule {}
