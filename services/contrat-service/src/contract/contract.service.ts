import { Injectable } from '@nestjs/common';
import { ContractValidator } from './../../../../application/validators/contract.validator';
import { UpdateContractUseCase } from './../../../../application/usecases/contract/update-contract.usecase';
import { GetAllContractsUseCase } from './../../../../application/usecases/contract/get-all-contract.usecase';
import { GetContractByIdUseCase } from './../../../../application/usecases/contract/get-contract-by-id.usecase';
import { DeleteContractUseCase } from './../../../../application/usecases/contract/delete-contract.usecase';
import { ContractRepository } from './../../../../Database/repositories/contract.repository';
import { Contract } from './../../../../domain/entité/contract';
import { CreateContractUseCase } from './../../../../application/usecases/contract/create-contract.usecase';
import { ContratDto } from '../../../../application/dtos/contract.dto';

@Injectable()
export class ContractsService {
    constructor(private readonly contractRepository: ContractRepository) {}

    async create(data: ContratDto): Promise<Contract> {
        return new CreateContractUseCase(this.contractRepository, new ContractValidator()).execute(data);
    }

    async update(id: string, data: Partial<Contract>): Promise<void> {
        return new UpdateContractUseCase(this.contractRepository, new ContractValidator()).execute(id, data);
    }

    async delete(id: string): Promise<void> {
        return new DeleteContractUseCase(this.contractRepository).execute(id);
    }

    async getById(id: string): Promise<Contract> {
        return new GetContractByIdUseCase(this.contractRepository).execute(id);
    }

    async getAll(): Promise<Contract[]> {
        return new GetAllContractsUseCase(this.contractRepository).execute();
    }
}