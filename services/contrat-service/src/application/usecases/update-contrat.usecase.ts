import { Injectable } from '@nestjs/common';
import { UpdateContratDto } from '../dtos/update-contrat.dto';
import { ContratResponseDto } from '../dtos/contrat-response.dto';

@Injectable()
export class UpdateContratUseCase {
  async execute(dto: UpdateContratDto): Promise<ContratResponseDto> {
    return { id: dto.id, numero: dto.numero, statut: dto.statut };
  }
} 