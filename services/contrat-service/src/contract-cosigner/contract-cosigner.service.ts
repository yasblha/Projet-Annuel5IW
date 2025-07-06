import { GetAllContractCosignersUseCase } from './../../../../application/usecases/contractCosigner/get-all-contract-cosigner.usecase';
import { GetContractCosignerByIdUseCase } from './../../../../application/usecases/contractCosigner/get-contract-cosigner-by-id.usecase';
import { DeleteContractCosignerUseCase } from './../../../../application/usecases/contractCosigner/delete-contract-cosigner.usecase';
import { UpdateContractCosignerUseCase } from './../../../../application/usecases/contractCosigner/update-contract-cosigner.usecase';
import { ContractCosignerValidator } from './../../../../application/validators/contractCosigner.validator';
import { CreateContractCosignerUseCase } from './../../../../application/usecases/contractCosigner/create-contract-cosigner.usecase';
import { ContractCosigner } from './../../../../domain/entité/contractCosigner';
import { ContractCosignerRepository } from './../../../../Database/repositories/contract-cosigner.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContractCosignersService {
    constructor(private readonly repo: ContractCosignerRepository) {}

    async create(data: ContractCosigner): Promise<ContractCosigner> {
        return new CreateContractCosignerUseCase(this.repo, new ContractCosignerValidator()).execute(data);
    }

    async update(id: string, updates: Partial<ContractCosigner>): Promise<void> {
        return new UpdateContractCosignerUseCase(this.repo, new ContractCosignerValidator()).execute(id, updates);
    }

    async delete(id: string): Promise<void> {
        return new DeleteContractCosignerUseCase(this.repo).execute(id);
    }

    async getById(id: string): Promise<ContractCosigner> {
        return new GetContractCosignerByIdUseCase(this.repo).execute(id);
    }

    async getAll(): Promise<ContractCosigner[]> {
        return new GetAllContractCosignersUseCase(this.repo).execute();
    }
}