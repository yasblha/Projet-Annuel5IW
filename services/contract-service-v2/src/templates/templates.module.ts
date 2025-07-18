import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesMessageHandler } from './templates.message-handler';
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
  providers: [TemplatesService, TemplatesMessageHandler],
  controllers: [TemplatesMessageHandler],
  exports: [TemplatesService],
})
export class TemplatesModule {}
