import { ContractCosignerRepository } from "@Database/repositories/contract-cosigner.repository";

export class DeleteContractCosignerUseCase {
    constructor(private readonly repo: ContractCosignerRepository) {}
    async execute(id: string): Promise<void> {
        await this.repo.remove(id);
    }
}