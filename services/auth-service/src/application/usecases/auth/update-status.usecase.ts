import { Inject } from '@nestjs/common';
import { UserRepository, UpdateStatusParams } from '@Database/repositories/user.repository';
import { User } from '@domain/entité/user';

export class UpdateStatusUseCase {
  constructor(@Inject('USER_REPOSITORY') private readonly repo: UserRepository) {}

  async execute(params: UpdateStatusParams): Promise<User> {
    await this.repo.updateStatus(params);
    return this.repo.findById(params.userId);
  }
}
