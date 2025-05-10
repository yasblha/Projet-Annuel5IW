export class ValidationService {
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
}