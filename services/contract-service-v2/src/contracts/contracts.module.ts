import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsMessageHandler } from './contracts.message-handler';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forFeature([]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'secret'),
      }),
    }),
  ],
  providers: [ContractsService, ContractsMessageHandler],
  controllers: [ContractsMessageHandler],
  exports: [ContractsService],
})
export class ContractsModule {}
