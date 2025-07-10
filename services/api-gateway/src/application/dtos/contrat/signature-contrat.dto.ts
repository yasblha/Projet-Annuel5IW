import { IsString, IsUUID, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class SignatureContratDto {
  @IsUUID()
  signataireId: string;

  @IsDateString()
  @IsOptional()
  dateSignature?: Date;

  @IsBoolean()
  @IsOptional()
  signatureElectronique?: boolean;

  @IsBoolean()
  @IsOptional()
  signatureManuelle?: boolean;

  @IsString()
  @IsOptional()
  certificatSignature?: string;

  @IsString()
  @IsOptional()
  commentaire?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;
} 