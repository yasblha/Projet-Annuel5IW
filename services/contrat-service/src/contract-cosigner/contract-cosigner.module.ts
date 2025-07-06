import { Module } from '@nestjs/common';
import { ContractCosignersService } from './contract-cosigner.service';
import { ContractCosignerController } from './contract-cosigner.controller';

@Module({
    imports: [],
    controllers: [ContractCosignerController],
    providers: [ContractCosignersService],
  })
  export class ContractCosignerModule {}
  