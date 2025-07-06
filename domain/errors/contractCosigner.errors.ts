export class ContractCosignerErrors {
    static MissingMandatoryFields(fields: string[]) {
        return new Error(`Champs obligatoires manquants pour le cosignataire: ${fields.join(', ')}`);
    }

    static InvalidCosignerType() {
        return new Error(`Type de cosignataire invalide`);
    }
}
