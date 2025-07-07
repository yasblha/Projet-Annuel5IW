import { IsEmail, IsEnum, IsOptional, IsString, Validate } from 'class-validator';
import { EmailDomainValidator } from '@application/validators/email-domain.validator';
import { PhoneFrenchValidator } from '@application/validators/phone-french.validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsEmail()
  @Validate(EmailDomainValidator)
  email?: string;

  @IsOptional()
  @IsString()
  @Validate(PhoneFrenchValidator)
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