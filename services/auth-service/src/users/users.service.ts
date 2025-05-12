import { Injectable } from '@nestjs/common';
import { User } from '@domain/entité/user';
import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';
import { RegisterInterfaceUsecase } from '@application/usecases/auth/register/register.interface.usecase';
import { AdminRegisterUseCase } from '@application/usecases/auth/register/register.admin.usecase';

@Injectable()
export class UsersService {
    private registerInterfaceUsecase: RegisterInterfaceUsecase;
    private adminRegisterUsecase: AdminRegisterUseCase;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService,
    ) {
        this.registerInterfaceUsecase = new RegisterInterfaceUsecase(userRepository, passwordService);
        this.adminRegisterUsecase = new AdminRegisterUseCase(userRepository, passwordService);
    }

    async registerFromInterface(userData: User): Promise<User> {
        return this.registerInterfaceUsecase.execute(userData);
    }

    async registerFromAdmin(adminUser: User, newUser: User): Promise<User> {
        return this.adminRegisterUsecase.execute(adminUser, newUser);
    }
}
