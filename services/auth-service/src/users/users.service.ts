import { Injectable } from '@nestjs/common';
import { User } from '@domain/entité/user';
import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';
import { RegisterInterfaceUsecase } from '@application/usecases/auth/register/register.interface.usecase';
import { AdminRegisterUseCase } from '@application/usecases/auth/register/register.admin.usecase';
import { PasswordValidator } from '@application/validators/password.validator';
import { LoginUseCase } from '@application/usecases/auth/login/login.usecase';

@Injectable()
export class UsersService {
    private registerInterfaceUsecase: RegisterInterfaceUsecase;
    private adminRegisterUsecase: AdminRegisterUseCase;
    private loginUsecase: LoginUseCase;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService,
    ) {
        this.registerInterfaceUsecase = new RegisterInterfaceUsecase(userRepository, passwordService, PasswordValidator);
        this.adminRegisterUsecase = new AdminRegisterUseCase(userRepository, passwordService, PasswordValidator);
        this.loginUsecase = new LoginUseCase(userRepository, passwordService);
    }

    async registerFromInterface(userData: User): Promise<User> {
        return this.registerInterfaceUsecase.execute(userData);
    }

    async registerFromAdmin(adminUser: User, newUser: User): Promise<User> {
        return this.adminRegisterUsecase.execute(adminUser, newUser);
    }

    async loginUser(email: string, password: string): Promise<User> {
        return this.loginUsecase.execute(email, password);
    }
}
