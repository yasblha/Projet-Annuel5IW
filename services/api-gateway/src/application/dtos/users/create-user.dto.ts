import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class AdresseDto {
  @IsNotEmpty()
  @IsEnum(['PRINCIPALE', 'FACTURATION', 'LIVRAISON'])
  type: string;

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

  @IsNotEmpty()
  @IsString()
  pays: string;
}

export class EntrepriseDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  siret?: string;

  @IsOptional()
  @IsObject()
  adresse?: any;

  @IsOptional()
  @IsString()
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
  email: string;

  @IsOptional()
  @IsPhoneNumber('FR')
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

  @IsOptional()
  @IsString()
  type?: string;
} 