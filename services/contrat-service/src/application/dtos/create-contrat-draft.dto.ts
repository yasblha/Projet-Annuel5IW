import { IsString, IsUUID, IsDateString, IsNotEmpty, IsOptional, IsEnum, IsIn } from 'class-validator';
import { CreateCosignataireDto } from './cosignataire.dto';

export class CreateContratDraftDto {
  @IsUUID()
  proprietaireId: string;

  @IsString()
  @IsNotEmpty()
  typeProprietaire: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['TLS', 'PAR', 'MAR', 'LYO', 'NAN', 'BOR', 'MON', 'NIC', 'STR', 'LIL'])
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