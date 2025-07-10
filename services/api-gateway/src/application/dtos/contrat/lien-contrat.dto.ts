import { IsString, IsUUID, IsOptional } from 'class-validator';

export class LienAbonnementDto {
  @IsUUID()
  abonnementId: string;

  @IsString()
  @IsOptional()
  commentaire?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;
}

export class LienCompteurDto {
  @IsUUID()
  compteurId: string;

  @IsString()
  @IsOptional()
  motif?: string;

  @IsString()
  @IsOptional()
  commentaire?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;
}

export class LienClientDto {
  @IsUUID()
  clientId: string;

  @IsString()
  @IsOptional()
  commentaire?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;
} 