import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { InterventionModule } from './intervention/intervention.module';
import { HealthController } from './health.controller';
import { MetadataController } from './metadata.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), InterventionModule],
  controllers: [AppController, HealthController, MetadataController],
  providers: [AppService],
})
export class AppModule {}
