export class ContractValidator {
    /**
     * Vérifie que tous les champs obligatoires sont présents
     */
    static getMissingFields(object: Record<string, any>, fields: string[]): string[] {
        return fields.filter((field) => !object[field]);
    }

    /**
     * Vérifie que la date de fin n’est pas antérieure à la date de début
     */
    static validateDates(dateDeb: Date | undefined, dateFin: Date | null | undefined): boolean {
        if (dateDeb == null || (dateFin && dateDeb > dateFin)) {
            return false;
        }
        return true;
    }

    /**
     * Vérifie que le type de propriétaire est valide
     */
    static validateOwnerType(type: string | undefined): boolean {
        if (type == undefined || !['UTILISATEUR', 'ENTREPRISE'].includes(type)) {
            return false;
        }
        return true;
    }

    /**
     * Vérifie que le statut est reconnu
     */
    static validateStatut(statut: string | undefined): boolean {
        const validStatuts = ['EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'ANNULE', 'TERMINE'];
        if (statut == undefined || !validStatuts.includes(statut)) {
            return false;
        }
        return true;
    }
}
