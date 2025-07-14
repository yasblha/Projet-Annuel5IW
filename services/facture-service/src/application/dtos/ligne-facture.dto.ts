import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { LigneFactureType } from '../../domain/enums/ligne-facture-type.enum';

export class CreateLigneFactureDto {
  @IsString()
  @IsOptional()
  @IsUUID()
  factureId?: string;

  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsEnum(LigneFactureType)
  @IsNotEmpty()
  type: LigneFactureType;

  @IsNumber()
  @Min(0)
  quantite: number;

  @IsNumber()
  @Min(0)
  prixUnitaire: number;

  @IsNumber()
  @Min(0)
  montantHT: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tauxTVA?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  montantTVA?: number;

  @IsNumber()
  @Min(0)
  montantTTC: number;

  @IsNumber()
  @IsOptional()
  ordre?: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  details?: string;
}

export class UpdateLigneFactureDto {
  @IsString()
  @IsOptional()
  libelle?: string;

  @IsEnum(LigneFactureType)
  @IsOptional()
  type?: LigneFactureType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantite?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  prixUnitaire?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  montantHT?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tauxTVA?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  montantTVA?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  montantTTC?: number;

  @IsNumber()
  @IsOptional()
  ordre?: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  details?: string;
}
