import { UserRepository } from '@Database/repositories/user.repository';
import { User } from '@domain/entité/user';
import { PasswordService } from '@application/services/password.service';
import { RegisterErrors } from '@domain/errors/register.errors';
import { PasswordValidator } from '@application/validators/password.validator';

export class RegisterInterfaceUsecase {
    constructor(
      private readonly userRepository: UserRepository,
      private readonly passwordService: PasswordService,
      private readonly passwordValidator: typeof PasswordValidator
    ) {}

    public async execute(user: User): Promise<User> {
        const requiredFields = ['nom', 'prenom', 'email', 'hashMotDePasse', 'role', 'tenantId'];
        const missingFields = this.passwordValidator.getMissingFields(user, requiredFields);

        if (missingFields.length > 0) {
            throw RegisterErrors.MissingMandatoryFields(missingFields);
        }

        if (!this.passwordValidator.validateEmailFormat(user.email)) {
            throw RegisterErrors.InvalidEmailFormat();
        }

        const existingUser = await this.userRepository.findByEmail(user.email);
        if (existingUser) {
            throw RegisterErrors.EmailAlreadyUsed();
        }

        if (user.telephone) {
            const existingPhone = await this.userRepository.findByPhone(user.telephone);
            if (existingPhone) {
                throw RegisterErrors.PhoneAlreadyUsed();
            }
        }

        if (!this.passwordService.validatePasswordStrength(user.hashMotDePasse)) {
            throw RegisterErrors.WeakPassword();
        }

        const hasPersonalInfo = this.passwordValidator.validatePasswordPersonalInfo(
          user.hashMotDePasse,
          [user.nom, user.prenom, user.email, user.telephone].filter(Boolean) as string[]
        );
        if (hasPersonalInfo) {
            throw RegisterErrors.PasswordContainsPersonalInfo();
        }

        const hashed = await this.passwordService.hashPassword(user.hashMotDePasse);

        return this.userRepository.create({
            ...user,
            telephone: user.telephone ?? null,
            hashMotDePasse: hashed,
        });
    }
}
