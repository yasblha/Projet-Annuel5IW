import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ClientAdresseDto {
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

export class ClientEntrepriseDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  siret?: string;

  @IsOptional()
  adresse?: any;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactTelephone?: string;
}

export class CreateClientDto {
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
  @IsEnum(['PARTICULIER', 'ENTREPRISE'])
  type: string;

  @IsOptional()
  @IsEnum(['ACTIF', 'INACTIF', 'SUSPENDU'])
  statut?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClientAdresseDto)
  adresse?: ClientAdresseDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClientEntrepriseDto)
  entreprise?: ClientEntrepriseDto;
} 