import { Inject } from '@nestjs/common';
import { UserRepository, CreateUserParams } from '@Database/repositories/user.repository';
import { User } from '@domain/entité/user';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(data: CreateUserParams): Promise<User> {
    console.log('Création utilisateur', data.email);
    return this.userRepository.create(
      data
    );
  }
}
