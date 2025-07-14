import { IsString, IsUUID, IsNotEmpty, IsOptional, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { UpdateCosignataireDto } from './cosignataire.dto';

export class UpdateContratDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  numero?: string;

  @IsString()
  @IsOptional()
  statut?: 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU' | 'ANNULE' | 'TERMINE' | 'RESILIE';

  @IsString()
  @IsOptional()
  objet?: string;

  @IsNumber()
  @IsOptional()
  montantTotal?: number;

  @IsDateString()
  @IsOptional()
  dateFin?: Date;

  @IsString()
  @IsOptional()
  motifResiliation?: string;

  @IsDateString()
  @IsOptional()
  dateResiliation?: Date;

  @IsString()
  @IsOptional()
  statutSignature?: 'EN_ATTENTE' | 'SIGNE' | 'REFUSE';

  @IsDateString()
  @IsOptional()
  dateSignature?: Date;

  @IsUUID()
  @IsOptional()
  compteurId?: string;

  @IsUUID()
  @IsOptional()
  abonnementId?: string;

  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsOptional()
  cosignataires?: UpdateCosignataireDto[];
} 