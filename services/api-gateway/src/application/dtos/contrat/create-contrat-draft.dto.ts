import { IsString, IsUUID, IsDateString, IsNotEmpty, IsOptional, IsEnum, Matches } from 'class-validator';
import { CreateCosignataireDto } from './cosignataire.dto';

export class CreateContratDraftDto {
  @IsOptional()
  @IsUUID()
  proprietaireId?: string;

  @IsString()
  @IsNotEmpty()
  typeProprietaire: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9_-]{2,10}$/)
  zone: string;

  @IsEnum(['I', 'P', 'C', 'A'])
  @IsNotEmpty()
  typeContrat: 'I' | 'P' | 'C' | 'A';

  @IsDateString()
  dateDebut: Date;

  @IsOptional()
  @IsUUID()
  compteurId?: string;

  @IsOptional()
  @IsUUID()
  abonnementId?: string;

  @IsOptional()
  cosignataires?: CreateCosignataireDto[];

  @IsOptional()
  @IsString()
  tenantId?: string;
} 