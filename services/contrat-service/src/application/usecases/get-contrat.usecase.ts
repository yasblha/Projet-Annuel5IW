import { Injectable } from '@nestjs/common';
import { ContratResponseDto } from '../dtos/contrat-response.dto';

@Injectable()
export class GetContratUseCase {
  async execute(id: string): Promise<ContratResponseDto> {
    return { id, numero: 'C-001', statut: 'EN_ATTENTE' };
  }
} 