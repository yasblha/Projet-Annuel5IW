import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export enum LotFacturationStatut {
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ERREUR = 'ERREUR',
}

export enum LotFacturationType {
  MENSUELLE = 'MENSUELLE',
  TRIMESTRIELLE = 'TRIMESTRIELLE',
  ANNUELLE = 'ANNUELLE',
  PONCTUELLE = 'PONCTUELLE',
}

export class CreateLotFacturationDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(LotFacturationType)
  @IsNotEmpty()
  typeLot: LotFacturationType;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  mois: number;

  @IsInt()
  @Min(2000)
  @IsNotEmpty()
  annee: number;

  @IsDateString()
  @IsOptional()
  dateDebut?: Date;

  @IsDateString()
  @IsOptional()
  dateFin?: Date;

  @IsString()
  @IsOptional()
  criteres?: string; // JSON stringified criteria for filtering contracts

  @IsString()
  @IsOptional()
  @IsUUID(4, { each: true })
  contratIds?: string[]; // Optional specific contract IDs to process

  @IsNumber()
  @IsOptional()
  @Min(0)
  montantTotal?: number;

  @IsString()
  @IsOptional()
  commentaire?: string;
}

export class UpdateLotFacturationDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LotFacturationStatut)
  @IsOptional()
  statut?: LotFacturationStatut;

  @IsNumber()
  @IsOptional()
  @Min(0)
  nbFacturesTotal?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  nbFacturesTraitees?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  nbFacturesErreur?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  montantTotal?: number;

  @IsDateString()
  @IsOptional()
  dateFinTraitement?: Date;

  @IsString()
  @IsOptional()
  messageErreur?: string;

  @IsString()
  @IsOptional()
  commentaire?: string;
}
