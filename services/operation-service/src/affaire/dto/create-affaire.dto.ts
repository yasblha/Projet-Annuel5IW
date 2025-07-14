import { IsString, IsNumber, IsIn } from 'class-validator';

export class CreateAffaireDto {
  @IsString()
  clientId: string;

  @IsString()
  zoneCode: string;

  @IsNumber()
  debitDemande: number;
}
