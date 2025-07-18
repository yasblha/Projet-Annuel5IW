import { IsOptional, IsString } from 'class-validator';

export class ValidateContractDto {
  @IsString()
  @IsOptional()
  token?: string; // Pour extraire l'agencyId
}
