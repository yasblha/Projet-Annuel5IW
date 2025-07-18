import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContractV2Dto {
  @ApiProperty({ description: 'ID du client associé au contrat' })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ description: 'ID du template de contrat à utiliser' })
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ description: 'Date de début du contrat', example: '2023-01-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Date de fin du contrat (optionnelle)', example: '2024-01-01', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
