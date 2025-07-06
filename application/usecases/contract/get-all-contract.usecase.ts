import { ContractRepository } from "@Database/repositories/contract.repository";
import { Contract } from "@domain/entité/contract";

export class GetAllContractsUseCase {
    constructor(private readonly repo: ContractRepository) {}
    async execute(): Promise<Contract[]> {
        return this.repo.findAll();
    }
}