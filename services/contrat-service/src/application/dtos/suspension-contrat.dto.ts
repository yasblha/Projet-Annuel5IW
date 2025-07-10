import { IsString, IsOptional, IsDateString } from 'class-validator';

export class SuspensionContratDto {
  @IsString()
  motifSuspension: string;

  @IsDateString()
  @IsOptional()
  dateSuspension?: Date;

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