import { ContractCosignerRepository } from "@Database/repositories/contract-cosigner.repository";
import { ContractCosigner } from "@domain/entité/contractCosigner";

export class GetContractCosignerByIdUseCase {
    constructor(private readonly repo: ContractCosignerRepository) {}
    async execute(id: string): Promise<ContractCosigner> {
        return this.repo.findById(id);
    }
}