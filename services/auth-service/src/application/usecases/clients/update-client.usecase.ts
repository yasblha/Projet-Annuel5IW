import { Injectable, Logger } from '@nestjs/common';
import { ClientRepository, CreateClientParams } from '@Database/repositories/client.repository';

export interface UpdateClientParams extends Partial<CreateClientParams> {
  id: string;
}

@Injectable()
export class UpdateClientUseCase {
  private readonly logger = new Logger(UpdateClientUseCase.name);

  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(data: UpdateClientParams) {
    this.logger.log(`[UpdateClientUseCase] Update client ${data.id}`);

    // Retrieve existing client
    const existing = await this.clientRepository.findById(data.id);
    if (!existing) {
      this.logger.warn(`[UpdateClientUseCase] Client not found: ${data.id}`);
      throw new Error(`Client ${data.id} introuvable`);
    }

    // Clean id from update payload
    const { id, ...updateData } = data;

    // Inject dateMaj
    (updateData as any).dateMaj = new Date();

    // Perform update
    const updated = await this.clientRepository.update(id, updateData);
    if (!updated) {
      throw new Error(`Échec mise à jour client ${id}`);
    }

    this.logger.log(`[UpdateClientUseCase] Client ${id} mis à jour`);
    return updated;
  }
}
