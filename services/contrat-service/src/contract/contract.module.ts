import { Module } from '@nestjs/common';
import { ContractsService } from './contract.service';
import { ContractController } from './contract.controller';

@Module({
    imports: [],
    controllers: [ContractController],
    providers: [ContractsService],
  })
  export class ContractModule {}
  