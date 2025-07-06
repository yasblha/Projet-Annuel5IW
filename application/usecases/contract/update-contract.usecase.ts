import { ContractValidator } from "@application/validators/contract.validator";
import { ContractRepository } from "@Database/repositories/contract.repository";
import { Contract } from "@domain/entité/contract";
import { ContratErrors } from "@domain/errors/contract.errors";

export class UpdateContractUseCase {
    constructor(
        private readonly repo: ContractRepository,
        private readonly contractValidator: typeof ContractValidator
    ) {}
    async execute(id: string, updates: Partial<Contract>): Promise<void> {
        const requiredFields = ['proprietaireId', 'typeProprietaire', 'numero', 'dateDebut', 'statut'];
        const missingFields = this.contractValidator.getMissingFields(updates, requiredFields);
        
        if (missingFields.length > 0) {
            throw ContratErrors.MissingMandatoryFields(missingFields);
        }
        
        if (this.contractValidator.validateOwnerType(updates.typeProprietaire?.toString())) {
            throw ContratErrors.InvalidOwnerType();
        }
        
        if (this.contractValidator.validateDates(updates.dateDebut, updates.dateFin)) {
            throw ContratErrors.EndDateBeforeStartDate();
        }
        
        if (this.contractValidator.validateStatut(updates.statut)) {
            throw ContratErrors.InvalidStatus();
        }
        
        await this.repo.update(id, updates);
    }
}