import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFactureDto {
  @ApiProperty({ 
    description: 'ID du client associé à la facture',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  clientId: string;

  @ApiProperty({ 
    description: 'ID du contrat associé à la facture',
    example: '550e8400-e29b-41d4-a716-446655440001' 
  })
  @IsUUID()
  contratId: string;

  @ApiProperty({ 
    description: 'Montant HT de la facture',
    example: 1500.50 
  })
  @IsNumber()
  montantHT: number;

  @ApiProperty({ 
    description: 'Taux de TVA applicable',
    example: 20.0,
    default: 20.0
  })
  @IsNumber()
  @IsOptional()
  tauxTVA: number;

  @ApiProperty({ 
    description: 'Date d\'échéance de la facture',
    example: '2025-12-31'
  })
  @IsDateString()
  dateEcheance: string;

  @ApiProperty({ 
    description: 'Description ou commentaires sur la facture',
    example: 'Facture pour installation et maintenance système hydraulique',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Lignes de facturation détaillées',
    type: [Object],
    example: [
      { 
        libelle: 'Installation système', 
        quantite: 1, 
        prixUnitaire: 1000.00,
        tauxTVA: 20
      },
      { 
        libelle: 'Main d\'oeuvre', 
        quantite: 5, 
        prixUnitaire: 100.10,
        tauxTVA: 20
      }
    ]
  })
  lignesFacture: Array<{
    libelle: string;
    quantite: number;
    prixUnitaire: number;
    tauxTVA?: number;
  }>;
}
