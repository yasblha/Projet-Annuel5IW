import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignCompteurDto {
  @IsUUID()
  @IsNotEmpty()
  contratId: string;

  @IsUUID()
  @IsNotEmpty()
  compteurId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
} 