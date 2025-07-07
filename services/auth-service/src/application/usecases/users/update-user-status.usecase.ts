import { Injectable } from '@nestjs/common';
import { UserRepository } from '@Database/repositories/user.repository';

@Injectable()
export class UpdateUserStatusUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number, statut: 'EN_ATTENTE_VALIDATION' | 'ACTIF' | 'SUSPENDU' | 'BLACKLISTE' | 'ARCHIVE' | 'SUPPRIME') {
    return this.userRepository.updateStatus({ userId: id, statut });
  }
} 