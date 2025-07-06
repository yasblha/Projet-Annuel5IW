import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContractModule } from './contract/contract.module';
import { ContractCosignerModule } from './contract-cosigner/contract-cosigner.module';

@Module({
  imports: [ContractModule, ContractCosignerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
