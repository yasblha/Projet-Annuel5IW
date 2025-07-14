import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLigneFactureDto } from './ligne-facture.dto';
import { FactureStatut } from '../../domain/enums/facture-statut.enum';

export class CreateFactureDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  contratId: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsString()
  @IsOptional()
  numero?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsOptional()
  dateEmission?: Date;

  @IsDateString()
  @IsOptional()
  dateEcheance?: Date;

  @IsString()
  @IsOptional()
  statut?: FactureStatut;

  @IsNumber()
  @IsOptional()
  montantHT?: number;

  @IsNumber()
  @IsOptional()
  montantTVA?: number;

  @IsNumber()
  @IsOptional()
  montantTTC?: number;

  @IsString()
  @IsOptional()
  periodeDebut?: string;

  @IsString()
  @IsOptional()
  periodeFin?: string;

  @IsString()
  @IsOptional()
  commentaire?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateLigneFactureDto)
  lignes: CreateLigneFactureDto[];

  @IsString()
  @IsOptional()
  @IsUUID()
  lotFacturationId?: string;

  @IsOptional()
  adresseFacturation?: any;

  @IsOptional()
  relevesCompteur?: {
    debut: number;
    fin: number;
    date: Date;
  };
}
