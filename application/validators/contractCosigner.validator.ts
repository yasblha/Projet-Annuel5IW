export class ContractCosignerValidator {
    /**
     * Vérifie la présence des champs obligatoires
     */
    static getMissingFields(object: Record<string, any>, fields: string[]): string[] {
        return fields.filter((field) => !object[field]);
    }

    /**
     * Vérifie que le type de cosignataire est valide
     */
    static validateCosignerType(type: string | undefined): boolean {
        const validTypes = ['UTILISATEUR', 'ENTREPRISE'];
        if (type == undefined || !validTypes.includes(type)) {
            return false;
        }
        return true;
    }
}
