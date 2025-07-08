import { Inject } from '@nestjs/common';
import { UserRepository } from '@Database/repositories/user.repository';
import { User } from '@domain/entité/user';

export class ActivateUserUseCase {
  constructor(private readonly repo: UserRepository) {}


  async execute(userId: number, newHash: string): Promise<User> {
    const user = await this.repo.findById(userId);
    await this.repo.activateUser( userId, newHash);
    return user;
  }
}
