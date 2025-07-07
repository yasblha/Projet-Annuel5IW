import { Injectable } from '@nestjs/common';
import { UserRepository } from '@Database/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number) {
    return this.userRepository.delete(id);
  }
} 