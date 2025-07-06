import { ContractRepository } from "@Database/repositories/contract.repository";
import { Contract } from "@domain/entité/contract";
import { ContractValidator } from '@application/validators/contract.validator';
import { ContratErrors } from '@domain/errors/contract.errors';

export class CreateContractUseCase {
    constructor(
        private readonly repo: ContractRepository,
        private readonly contractValidator: typeof ContractValidator
    ) {}

    async execute(data: Contract): Promise<Contract> {
        const existing = await this.repo.findByNumero(data.numero);
        if (existing) throw new Error('Contract already exists.');

        const requiredFields = ['proprietaireId', 'typeProprietaire', 'numero', 'dateDebut', 'statut'];
        const missingFields = this.contractValidator.getMissingFields(data, requiredFields);

        if (missingFields.length > 0) {
            throw ContratErrors.MissingMandatoryFields(missingFields);
        }

        if (this.contractValidator.validateOwnerType(data.typeProprietaire)) {
            throw ContratErrors.InvalidOwnerType();
        }

        if (this.contractValidator.validateDates(data.dateDebut, data.dateFin)) {
            throw ContratErrors.EndDateBeforeStartDate();
        }

        if (this.contractValidator.validateStatut(data.statut)) {
            throw ContratErrors.InvalidStatus();
        }

        return this.repo.create(data);
    }
}