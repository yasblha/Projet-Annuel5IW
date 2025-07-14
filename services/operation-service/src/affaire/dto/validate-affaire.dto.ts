import { IsNumber, IsOptional } from 'class-validator';

export class ValidateAffaireDto {
  @IsNumber()
  @IsOptional()
  montantDevis?: number;

  @IsNumber()
  @IsOptional()
  longueurBranchement?: number;
}
