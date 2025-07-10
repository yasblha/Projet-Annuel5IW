import { IsString, IsOptional, IsDateString } from 'class-validator';

export class ResiliationContratDto {
  @IsString()
  motifResiliation: string;

  @IsDateString()
  @IsOptional()
  dateResiliation?: Date;

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