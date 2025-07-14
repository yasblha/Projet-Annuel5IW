import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaiementStatut, PaiementType } from '../../domain/enums/paiement-type.enum';

export class CreatePaiementDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  factureId: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsNumber()
  @Min(0.01)
  montant: number;

  @IsEnum(PaiementType)
  @IsNotEmpty()
  typePaiement: PaiementType;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsDateString()
  @IsOptional()
  dateOperation?: Date;

  @IsEnum(PaiementStatut)
  @IsOptional()
  statut?: PaiementStatut = PaiementStatut.EN_ATTENTE;

  @IsString()
  @IsOptional()
  details?: string;
}

export class UpdatePaiementDto {
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  montant?: number;

  @IsEnum(PaiementType)
  @IsOptional()
  typePaiement?: PaiementType;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsDateString()
  @IsOptional()
  dateOperation?: Date;

  @IsEnum(PaiementStatut)
  @IsOptional()
  statut?: PaiementStatut;

  @IsString()
  @IsOptional()
  details?: string;
}
