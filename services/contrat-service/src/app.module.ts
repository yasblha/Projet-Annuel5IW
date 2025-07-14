import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContratModule } from './contrat/contrat.module';
import { MetadataController } from './metadata.controller';

@Module({
  imports: [ContratModule],
  controllers: [AppController, MetadataController],
  providers: [AppService],
})
export class AppModule {}
