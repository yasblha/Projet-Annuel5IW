import { Injectable } from '@nestjs/common';
import { UserRepository } from '@Database/repositories/user.repository';

export interface UpdateUserParams {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: string;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(params: UpdateUserParams) {
    return this.userRepository.update(params.id, params);
  }
} 