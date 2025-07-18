import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AdresseDto {
  @IsString()
  @IsNotEmpty()
  ligne1: string;

  @IsString()
  @IsOptional()
  ligne2?: string;

  @IsString()
  @IsNotEmpty()
  codePostal: string;

  @IsString()
  @IsNotEmpty()
  ville: string;

  @IsString()
  @IsOptional()
  pays?: string = 'France';

  @IsString()
  @IsOptional()
  type?: string = 'PRINCIPALE';
}

export class EntrepriseDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsOptional()
  siret?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactTelephone?: string;
}

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsEnum(['PARTICULIER', 'ENTREPRISE'])
  type: 'PARTICULIER' | 'ENTREPRISE' = 'PARTICULIER';

  @IsEnum(['PROSPECT', 'ACTIF', 'SUSPENDU', 'INACTIF', 'RESILIE', 'ARCHIVE'])
  @IsOptional()
  statut?: 'PROSPECT' | 'ACTIF' | 'SUSPENDU' | 'INACTIF' | 'RESILIE' | 'ARCHIVE' = 'PROSPECT';

  @ValidateNested()
  @Type(() => AdresseDto)
  @IsOptional()
  adresse?: AdresseDto;

  @ValidateNested()
  @Type(() => EntrepriseDto)
  @IsOptional()
  entreprise?: EntrepriseDto;

  // Format plat pour les adresses (pour compatibilité avec le frontend)
  @IsString()
  @IsOptional()
  adresseLigne1?: string;

  @IsString()
  @IsOptional()
  adresseLigne2?: string;

  @IsString()
  @IsOptional()
  codePostal?: string;

  @IsString()
  @IsOptional()
  ville?: string;

  // Champ pour le token JWT
  @IsString()
  @IsOptional()
  token?: string;
}
