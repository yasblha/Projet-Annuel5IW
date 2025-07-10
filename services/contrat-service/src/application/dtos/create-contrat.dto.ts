import { IsString, IsUUID, IsDateString, IsNotEmpty, IsOptional, IsEnum, IsIn } from 'class-validator';
import { CreateCosignataireDto } from './cosignataire.dto';

export class CreateContratDto {
  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsUUID()
  proprietaireId: string;

  @IsString()
  @IsNotEmpty()
  typeProprietaire: string;

  @IsString()
  @IsNotEmpty()
  zone: string;

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

export class CreateContratMetierDto extends CreateContratDto {
  @IsEnum(['I', 'P', 'C', 'A'])
  @IsNotEmpty()
  typeContrat: 'I' | 'P' | 'C' | 'A'; // I=Individuel, P=Particulier, C=Collectivité, A=Administration

  @IsString()
  @IsNotEmpty()
  @IsIn(['TLS', 'PAR', 'MAR', 'LYO', 'NAN', 'BOR', 'MON', 'NIC', 'STR', 'LIL']) // Zones autorisées
  zone: string;
} 