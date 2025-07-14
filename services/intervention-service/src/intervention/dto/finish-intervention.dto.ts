import { IsOptional, IsString, IsNumber } from 'class-validator';

export class FinishInterventionDto {
  @IsOptional()
  @IsString()
  resultat?: string;

  @IsOptional()
  @IsNumber()
  cout?: number;
}
