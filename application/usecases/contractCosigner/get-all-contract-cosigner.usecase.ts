import { ContractCosignerRepository } from "@Database/repositories/contract-cosigner.repository";
import { ContractCosigner } from "@domain/entité/contractCosigner";

export class GetAllContractCosignersUseCase {
    constructor(private readonly repo: ContractCosignerRepository) {}
    async execute(): Promise<ContractCosigner[]> {
        return this.repo.findAll();
    }
}
