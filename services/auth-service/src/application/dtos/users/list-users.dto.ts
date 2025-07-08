import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class ListUsersDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'CLIENT', 'TECHNICIEN', 'COMMERCIAL', 'SUPPORT', 'COMPTABLE', 'MANAGER'])
  role?: string;

  @IsOptional()
  @IsEnum(['EN_ATTENTE_VALIDATION', 'ACTIF', 'SUSPENDU', 'BLACKLISTE', 'ARCHIVE', 'SUPPRIME'])
  statut?: string;
} 