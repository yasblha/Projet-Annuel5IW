export class RegisterErrors extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RegisterError';
    }

    static EmailAlreadyUsed(): RegisterErrors {
        return new RegisterErrors('❌ L\'adresse email est déjà utilisée.');
    }

    static PhoneAlreadyUsed(): RegisterErrors {
        return new RegisterErrors('❌ Le numéro de téléphone est déjà utilisé.');
    }

    static WeakPassword(): RegisterErrors {
        return new RegisterErrors(
            '❌ Le mot de passe est trop faible. Il doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole.'
        );
    }

    static PasswordContainsPersonalInfo(): RegisterErrors {
        return new RegisterErrors(
            '❌ Le mot de passe contient des informations personnelles (nom, prénom, email ou téléphone).'
        );
    }

    static InvalidEmailFormat(): RegisterErrors {
        return new RegisterErrors('❌ Le format de l\'adresse email est invalide.');
    }

    static MissingMandatoryFields(fields: string[]): RegisterErrors {
        const formatted = fields.map(f => `« ${f} »`).join(', ');
        return new RegisterErrors(`❌ Les champs obligatoires suivants sont manquants : ${formatted}.`);
    }

    static TenantNotFound(): RegisterErrors {
        return new RegisterErrors('❌ L\'identifiant de l\'organisation (tenant) est introuvable.');
    }

    static UnexpectedError(): RegisterErrors {
        return new RegisterErrors('❌ Une erreur inattendue est survenue.');
    }

    static UnauthorizedAction(reason?: string): RegisterErrors {
        return new RegisterErrors(`⛔ Action non autorisée. ${reason ?? ''}`);
    }

}
