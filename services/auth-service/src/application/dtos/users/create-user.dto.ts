import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EmailDomainValidator } from '@application/validators/email-domain.validator';
import { PhoneFrenchValidator } from '@application/validators/phone-french.validator';

class AdresseDto {
  @IsNotEmpty()
  @IsString()
  type: string; // Ex: 'PRINCIPALE'

  @IsNotEmpty()
  @IsString()
  ligne1: string;

  @IsOptional()
  @IsString()
  ligne2?: string;

  @IsNotEmpty()
  @IsString()
  codePostal: string;

  @IsNotEmpty()
  @IsString()
  ville: string;

  @IsOptional()
  @IsString()
  pays?: string;
}

class EntrepriseDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  siret?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdresseDto)
  adresse?: AdresseDto;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactTelephone?: string;
}

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

  @IsOptional()
  @ValidateNested()
  @Type(() => AdresseDto)
  adresse?: AdresseDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EntrepriseDto)
  entreprise?: EntrepriseDto;
} 