import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContratModule } from './contrat/contrat.module';
import { MetadataController } from './metadata.controller';
import { SentryModule } from '@infrastructure/modules/sentry.module';
import { sentryConfig } from '@infrastructure/config/sentry.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SentryModule.forRoot(sentryConfig),
    ContratModule
  ],
  controllers: [AppController, MetadataController],
  providers: [AppService],
})
export class AppModule {}
