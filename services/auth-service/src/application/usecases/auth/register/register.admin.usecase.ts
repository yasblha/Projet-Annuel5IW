import { UserRepository } from '@Database/repositories/user.repository';
import { User } from '@domain/entité/user';
import { PasswordService } from '@application/services/password.service';
import { RegisterErrors } from '@domain/errors/register.errors';
import { PasswordValidator } from '@application/validators/password.validator';
import { UserRole } from '@domain/enums/user-role.enum';

export class AdminRegisterUseCase {
    constructor(
      private readonly userRepository: UserRepository,
      private readonly passwordService: PasswordService,
      private readonly passwordValidator: typeof PasswordValidator
    ) {}

    public async execute(admin: User, newUser: User): Promise<User> {
        if (admin.role !== UserRole.ADMIN) {
            throw RegisterErrors.UnauthorizedAction('Seul un administrateur peut créer de nouveaux utilisateurs.');
        }

        const requiredFields = ['nom', 'prenom', 'email', 'hashMotDePasse', 'role', 'tenantId'];
        const missingFields = this.passwordValidator.getMissingFields(newUser, requiredFields);

        if (missingFields.length > 0) {
            throw RegisterErrors.MissingMandatoryFields(missingFields);
        }

        if (!this.passwordValidator.validateEmailFormat(newUser.email)) {
            throw RegisterErrors.InvalidEmailFormat();
        }

        const existingUser = await this.userRepository.findByEmail(newUser.email);
        if (existingUser) {
            throw RegisterErrors.EmailAlreadyUsed();
        }

        if (newUser.telephone) {
            const existingPhone = await this.userRepository.findByPhone(newUser.telephone);
            if (existingPhone) {
                throw RegisterErrors.PhoneAlreadyUsed();
            }
        }

        if (!this.passwordService.validatePasswordStrength(newUser.hashMotDePasse)) {
            throw RegisterErrors.WeakPassword();
        }

        const hasPersonalInfo = this.passwordValidator.validatePasswordPersonalInfo(
          newUser.hashMotDePasse,
          [newUser.nom, newUser.prenom, newUser.email, newUser.telephone].filter(Boolean) as string[]
        );
        if (hasPersonalInfo) {
            throw RegisterErrors.PasswordContainsPersonalInfo();
        }

        const hashedPassword = await this.passwordService.hashPassword(newUser.hashMotDePasse);

        return this.userRepository.create({
            ...newUser,
            telephone: newUser.telephone ?? null,
            hashMotDePasse: hashedPassword,
        });
    }
}
