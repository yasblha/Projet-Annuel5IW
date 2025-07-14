import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '@Database/repositories/client.repository';

@Injectable()
export class GetClientByIdUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: string) {
    const client = await this.clientRepository.findById(id);
    if (!client) throw new NotFoundException('Client non trouvé');
    return client;
  }
} 