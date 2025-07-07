import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ enum: ['EN_ATTENTE_VALIDATION','ACTIF','SUSPENDU','BLACKLISTE','ARCHIVE','SUPPRIME'] })
  @IsEnum(['EN_ATTENTE_VALIDATION','ACTIF','SUSPENDU','BLACKLISTE','ARCHIVE','SUPPRIME'])
  statut: 'EN_ATTENTE_VALIDATION' | 'ACTIF' | 'SUSPENDU' | 'BLACKLISTE' | 'ARCHIVE' | 'SUPPRIME';
}