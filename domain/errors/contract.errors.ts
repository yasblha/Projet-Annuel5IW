export class ContratErrors {
    static MissingMandatoryFields(fields: string[]) {
        return new Error(`Champs obligatoires manquants: ${fields.join(', ')}`);
    }

    static EndDateBeforeStartDate() {
        return new Error("La date de fin est antérieure à la date de début.");
    }

    static InvalidOwnerType() {
        return new Error(`Type de propriétaire invalide`);
    }

    static InvalidStatus() {
        return new Error(`Statut de contrat inconnu`);
    }

    static DuplicateContractNumber() {
        return new Error(`Un contrat avec ce numéro existe déjà.`);
    }
}
