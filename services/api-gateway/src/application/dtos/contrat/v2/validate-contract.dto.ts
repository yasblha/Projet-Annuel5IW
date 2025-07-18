import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ValidateContractV2Dto {
  @ApiProperty({ description: 'Token d\'authentification (optionnel, sera extrait des headers si non fourni)', required: false })
  @IsString()
  @IsOptional()
  token?: string;
}
