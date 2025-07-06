import { ContractRepository } from "@Database/repositories/contract.repository";
import { Contract } from "@domain/entité/contract";

export class GetContractByIdUseCase {
    constructor(private readonly repo: ContractRepository) {}
    async execute(id: string): Promise<Contract> {
        return this.repo.findById(id);
    }
}