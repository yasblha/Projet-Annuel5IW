import { IsString, IsUUID, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateCosignataireDto } from './cosignataire.dto';

export class CreateContratDto {
  @IsString()
  @IsNotEmpty()
  zone: string;

  @IsUUID()
  proprietaireId: string;

  @IsString()
  @IsNotEmpty()
  typeProprietaire: 'UTILISATEUR' | 'ENTREPRISE';

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
} 