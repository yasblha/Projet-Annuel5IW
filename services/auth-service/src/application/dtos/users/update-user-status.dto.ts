import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsEnum(['EN_ATTENTE_VALIDATION', 'ACTIF', 'SUSPENDU', 'BLACKLISTE', 'ARCHIVE', 'SUPPRIME'])
  statut: string;
} 