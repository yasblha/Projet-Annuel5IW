import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { EmailDomainValidator } from '@application/validators/email-domain.validator';
import { PhoneFrenchValidator } from '@application/validators/phone-french.validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  prenom: string;

  @IsNotEmpty()
  @IsEmail()
  @Validate(EmailDomainValidator)
  email: string;

  @IsOptional()
  @IsString()
  @Validate(PhoneFrenchValidator)
  telephone?: string;

  @IsNotEmpty()
  @IsEnum(['ADMIN', 'CLIENT', 'TECHNICIEN', 'COMMERCIAL', 'SUPPORT', 'COMPTABLE', 'MANAGER'])
  role: string;

  @IsOptional()
  @IsEnum(['EN_ATTENTE_VALIDATION', 'ACTIF', 'SUSPENDU', 'BLACKLISTE', 'ARCHIVE', 'SUPPRIME'])
  statut?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
} 