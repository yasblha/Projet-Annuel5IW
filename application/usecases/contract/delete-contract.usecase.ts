import { ContractRepository } from "@Database/repositories/contract.repository";

export class DeleteContractUseCase {
    constructor(private readonly repo: ContractRepository) {}
    async execute(id: string): Promise<void> {
        await this.repo.remove(id);
    }
}