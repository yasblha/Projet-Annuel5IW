import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomBytes } from 'crypto';
import { User } from '@domain/entité/user';
import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';
import { RegisterInterfaceUsecase } from '@application/usecases/auth/register/register.interface.usecase';
import { AdminRegisterUseCase } from '@application/usecases/auth/register/register.admin.usecase';
import { PasswordValidator } from '@application/validators/password.validator';
import { LoginUseCase } from '@application/usecases/auth/login/login.usecase';
import { ForgotPasswordUsecase } from '@application/usecases/auth/forgot-password.usecase';
import { ChangePasswordUseCase } from '@application/usecases/auth/change-password.usecase';
import { UpdatePasswordUseCase } from '@application/usecases/auth/update-password.usecase';
import { UpdatePasswordInput } from '@application/usecases/auth/update-password.usecase';
import { UpdateProfileUseCase } from '@application/usecases/auth/update-profile.usecase';
import { InviteUserUsecase } from '@application/usecases/auth/invite-user.usecase';
import { ConfirmInvitationUseCase } from '@application/usecases/auth/confirm-invitation.usecase';
import { ActivateEmailUseCase } from '@application/usecases/auth/activate-email.usecase';
import { ResetPasswordUseCase } from '@application/usecases/auth/reset-password.usecase';


@Injectable()
export class UsersService {
    private registerInterfaceUsecase: RegisterInterfaceUsecase;
    private adminRegisterUsecase: AdminRegisterUseCase;
    private loginUsecase: LoginUseCase;
    private invitationTokens = new Map<string, string>();
    private forgotPasswordUsecase: ForgotPasswordUsecase;
    private changePasswordUsecase: ChangePasswordUseCase;
    private updateProfileUsecase: UpdateProfileUseCase;
    private updatePasswordUsecase: UpdatePasswordUseCase;
    private inviteUserUsecase: InviteUserUsecase;
    private confirmInvitationUsecase: ConfirmInvitationUseCase;
    private activateEmailUsecase: ActivateEmailUseCase;
    private resetPasswordUsecase: ResetPasswordUseCase;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService,
        @Inject('MAILER_SERVICE') private readonly mailerClient: ClientProxy,
    ) {
        this.registerInterfaceUsecase = new RegisterInterfaceUsecase(userRepository, passwordService, PasswordValidator);
        this.adminRegisterUsecase = new AdminRegisterUseCase(userRepository, passwordService, PasswordValidator);
        this.loginUsecase = new LoginUseCase(userRepository, passwordService);
        this.forgotPasswordUsecase = new ForgotPasswordUsecase(userRepository, passwordService);
        this.changePasswordUsecase = new ChangePasswordUseCase(userRepository, passwordService);
        this.updatePasswordUsecase = new UpdatePasswordUseCase(userRepository);
        this.updateProfileUsecase = new UpdateProfileUseCase(userRepository);
        this.inviteUserUsecase = new InviteUserUsecase(userRepository, mailerClient);
        this.confirmInvitationUsecase = new ConfirmInvitationUseCase(userRepository, passwordService, mailerClient);
        this.activateEmailUsecase = new ActivateEmailUseCase(userRepository, passwordService, mailerClient);
        this.resetPasswordUsecase = new ResetPasswordUseCase(userRepository, passwordService);
    }

    async registerFromInterface(userData: User): Promise<User> {
        const result = await this.registerInterfaceUsecase.execute(userData);
        this.mailerClient.emit('user.registered', {
            email: result.user.email,
            firstname: result.user.prenom,
            token: result.activationToken,
        });
        return result.user;
    }

    async registerFromAdmin(adminUser: User, newUser: User): Promise<User> {
        const user = await this.adminRegisterUsecase.execute(adminUser, newUser);
        this.mailerClient.emit('user.registered', {
            email: user.email,
            firstname: user.prenom,
        });
        return user;
    }

    async loginUser(email: string, password: string): Promise<User> {
        return this.loginUsecase.execute(email, password);
    }

    async inviteUser(userId: number): Promise<string> {
        return this.inviteUserUsecase.execute(userId, this.invitationTokens);
    }

    async confirmInvitation(token: string, password: string): Promise<any> {
        return this.confirmInvitationUsecase.execute(token, password, this.invitationTokens);
    }

    async activateEmail(token: string, password: string): Promise<any> {
        return this.activateEmailUsecase.execute(token, password);
    }

    async forgotPassword(email: string) {
        return this.forgotPasswordUsecase.execute(email);
    }

    async resetPassword(token: string, newPassword: string) {
        return this.resetPasswordUsecase.execute(token, newPassword);
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        return this.changePasswordUsecase.execute(userId, currentPassword, newPassword);
    }

    async updateProfile(userId: number, updateData: any) {
        return this.updateProfileUsecase.execute(userId, updateData);
    }

    async debugUserStatus(email: string) {
        return this.userRepository.debugUserStatus(email);
    }

    async getUserById(userId: number) {
        return this.userRepository.findById(userId);
    }
}
