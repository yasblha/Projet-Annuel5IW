import { Injectable } from '@nestjs/common';
import { UserRepository } from '@Database/repositories/user.repository';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  statut?: string;
}

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(params: ListUsersParams) {
    return this.userRepository.listUsers(params);
  }
} 