import { IsString, IsOptional, IsDateString } from 'class-validator';

export class RenouvellementContratDto {
  @IsDateString()
  nouvelleDateDebut: Date;

  @IsDateString()
  nouvelleDateFin: Date;

  @IsString()
  @IsOptional()
  motifRenouvellement?: string;

  @IsString()
  @IsOptional()
  commentaire?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  updatedBy?: string;
} 