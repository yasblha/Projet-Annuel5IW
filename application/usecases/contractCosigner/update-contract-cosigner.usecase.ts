import { ContractCosignerValidator } from "@application/validators/contractCosigner.validator";
import { ContractCosignerRepository } from "@Database/repositories/contract-cosigner.repository";
import { ContractCosigner } from "@domain/entité/contractCosigner";
import { ContractCosignerErrors } from "@domain/errors/contractCosigner.errors";

export class UpdateContractCosignerUseCase {
    constructor(
        private readonly repo: ContractCosignerRepository,
        private readonly contractCosignerValidator: typeof ContractCosignerValidator
    ) {}
    
    async execute(id: string, updates: Partial<ContractCosigner>): Promise<void> {
        const requiredFields = ['contratId', 'cosignataireId', 'typeCosignataire', 'roleType', 'pourcentageParts', 'statutInvitation'];
        const missingFields = this.contractCosignerValidator.getMissingFields(updates, requiredFields);
                
        if (missingFields.length > 0) {
            throw ContractCosignerErrors.MissingMandatoryFields(missingFields);
        }
                
        if (this.contractCosignerValidator.validateCosignerType(updates.typeCosignataire)) {
            throw ContractCosignerErrors.InvalidCosignerType();
        }
        await this.repo.update(id, updates);
    }
}