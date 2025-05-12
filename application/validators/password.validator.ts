export class PasswordValidator {
    static validateEmailFormat(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static getMissingFields(object: Record<string, any>, fields: string[]): string[] {
        return fields.filter((field) => !object[field]);
    }

    static isDefined(value: any): boolean {
        return value !== undefined && value !== null && value !== '';
    }

    /** Vérifie si le mot de passe est conforme aux exigences de sécurité */
    static validatePasswordCompliance(password: string): boolean {
        const complianceRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return complianceRegex.test(password);
    }

    /** Vérifie si le mot de passe contient des informations personnelles */
    static validatePasswordPersonalInfo(
        password: string,
        personalInfo: string[]
    ): boolean {
        const lowerPassword = password.toLowerCase();
        return personalInfo.some(info => lowerPassword.includes(info.toLowerCase()));
    }


}