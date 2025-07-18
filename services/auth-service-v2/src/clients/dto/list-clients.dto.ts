import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListClientsDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(['PARTICULIER', 'ENTREPRISE'])
  @IsOptional()
  type?: 'PARTICULIER' | 'ENTREPRISE';

  @IsEnum(['PROSPECT', 'ACTIF', 'SUSPENDU', 'INACTIF', 'RESILIE', 'ARCHIVE'])
  @IsOptional()
  statut?: 'PROSPECT' | 'ACTIF' | 'SUSPENDU' | 'INACTIF' | 'RESILIE' | 'ARCHIVE';
}
