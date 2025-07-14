import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ModePaiement {
  VIREMENT = 'VIREMENT',
  CARTE = 'CARTE',
  CHEQUE = 'CHEQUE',
  ESPECES = 'ESPECES',
  PRELEVEMENT = 'PRELEVEMENT'
}

export class EnregistrerPaiementDto {
  @ApiProperty({ 
    description: 'Montant du paiement',
    example: 1500.50 
  })
  @IsNumber()
  montant: number;

  @ApiProperty({
    description: 'Mode de paiement utilisé',
    enum: ModePaiement,
    example: ModePaiement.VIREMENT
  })
  @IsEnum(ModePaiement)
  modePaiement: ModePaiement;

  @ApiProperty({ 
    description: 'Date du paiement',
    example: '2025-07-13'
  })
  @IsDateString()
  datePaiement: string;

  @ApiProperty({ 
    description: 'Référence externe du paiement (numéro de transaction, etc.)',
    example: 'TR-2023-12345',
    required: false
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ 
    description: 'Commentaires sur le paiement',
    example: 'Paiement partiel suite à accord',
    required: false
  })
  @IsString()
  @IsOptional()
  commentaires?: string;
}
