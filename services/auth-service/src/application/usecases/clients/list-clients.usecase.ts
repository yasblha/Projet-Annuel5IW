import { Injectable, Logger } from '@nestjs/common';
import { ClientRepository, ListClientsParams } from '@Database/repositories/client.repository';

@Injectable()
export class ListClientsUseCase {
  private readonly logger = new Logger(ListClientsUseCase.name);

  constructor(
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(params: ListClientsParams) {
    this.logger.log(`🔍 [ListClientsUseCase] Recherche clients avec paramètres: ${JSON.stringify(params)}`);

    try {
      const result = await this.clientRepository.listClients(params);
      
      this.logger.log(`✅ [ListClientsUseCase] ${result.clients.length} clients trouvés sur ${result.total} total`);
      
      return result;
    } catch (error) {
      this.logger.error(`❌ [ListClientsUseCase] Erreur: ${error.message}`, error.stack);
      throw error;
    }
  }
} 