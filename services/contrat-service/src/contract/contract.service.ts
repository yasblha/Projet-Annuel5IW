import { Injectable } from '@nestjs/common';
import { ContractRepository } from '@Database/repositories/contract.repository';
import { CreateContractUseCase } from '@application/usecases/contract/create-contract.usecase';
import { UpdateContractUseCase } from '@application/usecases/contract/update-contract.usecase';
import { DeleteContractUseCase } from '@application/usecases/contract/delete-contract.usecase';
import { GetContractByIdUseCase } from '@application/usecases/contract/get-by-id.usecase';
import { GetAllContractsUseCase } from '@application/usecases/contract/get-all.usecase';
import { Contract } from '@domain/entité/contract';

@Injectable()
export class ContractsService {
    constructor(private readonly contractRepository: ContractRepository) {}

    async create(data: Contract): Promise<Contract> {
        return new CreateContractUseCase(this.contractRepository).execute(data);
    }

    async update(id: string, data: Partial<Contract>): Promise<void> {
        return new UpdateContractUseCase(this.contractRepository).execute(id, data);
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