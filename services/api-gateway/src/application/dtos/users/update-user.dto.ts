import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('FR')
  telephone?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'CLIENT', 'TECHNICIEN', 'COMMERCIAL', 'SUPPORT', 'COMPTABLE', 'MANAGER'])
  role?: string;

  @IsOptional()
  @IsEnum(['EN_ATTENTE_VALIDATION', 'ACTIF', 'SUSPENDU', 'BLACKLISTE', 'ARCHIVE', 'SUPPRIME'])
  statut?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
} 