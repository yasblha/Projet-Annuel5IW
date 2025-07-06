import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class ContractCosignerDto {
  @ApiProperty({ example: 'b2a5a82f-91f5-4e50-bd55-8c324b6e9b11' })
  @IsUUID()
  @IsNotEmpty()
  contratId: string;

  @ApiProperty({ example: 'a2c6df00-723f-482f-bb01-2d5f0c3f6b22' })
  @IsUUID()
  @IsNotEmpty()
  cosignataireId: string;

  @ApiProperty({ example: 'UTILISATEUR', enum: ['UTILISATEUR', 'ENTREPRISE'] })
  @IsEnum(['UTILISATEUR', 'ENTREPRISE'])
  typeCosignataire: 'UTILISATEUR' | 'ENTREPRISE';

  @ApiProperty({ example: 'PRINCIPAL', enum: ['PRINCIPAL', 'SECONDARY'], required: false })
  @IsOptional()
  @IsEnum(['PRINCIPAL', 'SECONDARY'])
  roleType?: 'PRINCIPAL' | 'SECONDARY';

  @ApiProperty({ example: 50, minimum: 0, maximum: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  pourcentageParts?: number;
}
