import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AffaireModule } from './affaire/affaire.module';
import { HealthController } from './health.controller';
import { MetadataController } from './metadata.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AffaireModule],
  controllers: [AppController, HealthController, MetadataController],
  providers: [AppService],
})
export class AppModule {}
