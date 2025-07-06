import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ContratDto {
  @ApiProperty({ example: 'd1f3a8b7-4d43-4e1e-9384-8a9381ffde90' })
  @IsUUID()
  @IsNotEmpty()
  proprietaireId: string;

  @ApiProperty({ example: 'UTILISATEUR', enum: ['UTILISATEUR', 'ENTREPRISE'] })
  @IsEnum(['UTILISATEUR', 'ENTREPRISE'])
  typeProprietaire: 'UTILISATEUR' | 'ENTREPRISE';

  @ApiProperty({ example: 'CTR-2025-001' })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({ example: new Date().toISOString() })
  @IsDate()
  dateDebut: Date;

  @ApiProperty({ example: new Date().toISOString(), required: false })
  @IsOptional()
  @IsDate()
  dateFin?: Date;

  @ApiProperty({
    example: 'EN_ATTENTE',
    enum: ['EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'ANNULE', 'TERMINE'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'ANNULE', 'TERMINE'])
  statut?: 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU' | 'ANNULE' | 'TERMINE';
}
