import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AdresseDto, EntrepriseDto } from './create-client.dto';

export class UpdateClientDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  prenom?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsEnum(['PARTICULIER', 'ENTREPRISE'])
  @IsOptional()
  type?: 'PARTICULIER' | 'ENTREPRISE';

  @IsEnum(['PROSPECT', 'ACTIF', 'SUSPENDU', 'INACTIF', 'RESILIE', 'ARCHIVE'])
  @IsOptional()
  statut?: 'PROSPECT' | 'ACTIF' | 'SUSPENDU' | 'INACTIF' | 'RESILIE' | 'ARCHIVE';

  @ValidateNested()
  @Type(() => AdresseDto)
  @IsOptional()
  adresse?: AdresseDto;

  @ValidateNested()
  @Type(() => EntrepriseDto)
  @IsOptional()
  entreprise?: EntrepriseDto;
}
