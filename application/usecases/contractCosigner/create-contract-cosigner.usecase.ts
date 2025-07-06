import { ContractCosignerValidator } from "@application/validators/contractCosigner.validator";
import { ContractCosignerRepository } from "@Database/repositories/contract-cosigner.repository";
import { ContractCosigner } from "@domain/entité/contractCosigner";
import { ContractCosignerErrors } from "@domain/errors/contractCosigner.errors";

export class CreateContractCosignerUseCase {
    constructor(
        private readonly repo: ContractCosignerRepository,
        private readonly contractCosignerValidator: typeof ContractCosignerValidator
    ) {}

    async execute(data: ContractCosigner): Promise<ContractCosigner> {
        const existing = await this.repo.findById(data.contratId);
        if (!existing) throw new Error("Contract doesn't exists.");
        
        const requiredFields = ['contratId', 'cosignataireId', 'typeCosignataire', 'roleType', 'pourcentageParts', 'statutInvitation'];
        const missingFields = this.contractCosignerValidator.getMissingFields(data, requiredFields);
        
        if (missingFields.length > 0) {
            throw ContractCosignerErrors.MissingMandatoryFields(missingFields);
        }
        
        if (this.contractCosignerValidator.validateCosignerType(data.typeCosignataire)) {
            throw ContractCosignerErrors.InvalidCosignerType();
        }

        return this.repo.create(data);
    }
}