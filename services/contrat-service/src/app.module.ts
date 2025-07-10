import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContratModule } from './contrat/contrat.module';

@Module({
  imports: [ContratModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
