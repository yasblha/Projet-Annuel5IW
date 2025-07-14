import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum TypeLotFacturation {
  MENSUEL = 'MENSUEL',
  TRIMESTRIEL = 'TRIMESTRIEL',
  ANNUEL = 'ANNUEL',
  PONCTUEL = 'PONCTUEL'
}

export class LotFacturationDto {
  @ApiProperty({ 
    description: 'Nom du lot de facturation',
    example: 'Facturation mensuelle Juillet 2025' 
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({
    description: 'Type de lot de facturation',
    enum: TypeLotFacturation,
    example: TypeLotFacturation.MENSUEL
  })
  @IsEnum(TypeLotFacturation)
  typeLot: TypeLotFacturation;

  @ApiProperty({ 
    description: 'Date de début de la période de facturation',
    example: '2025-07-01'
  })
  @IsDateString()
  dateDebut: string;

  @ApiProperty({ 
    description: 'Date de fin de la période de facturation',
    example: '2025-07-31'
  })
  @IsDateString()
  dateFin: string;

  @ApiProperty({ 
    description: 'IDs des contrats à inclure dans ce lot (facultatif)',
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    required: false,
    type: [String]
  })
  @IsUUID(4, { each: true })
  @IsOptional()
  contratIds?: string[];

  @ApiProperty({ 
    description: 'Notes ou commentaires sur ce lot',
    example: 'Facturation exceptionnelle incluant les frais de maintenance',
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
