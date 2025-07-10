import { IsString, IsUUID, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateCosignataireDto {
  @IsUUID()
  cosignataireId: string;

  @IsEnum(['UTILISATEUR', 'ENTREPRISE'])
  typeCosignataire: 'UTILISATEUR' | 'ENTREPRISE';

  @IsOptional()
  @IsEnum(['PRINCIPAL', 'SECONDARY'])
  roleType?: 'PRINCIPAL' | 'SECONDARY';

  @IsOptional()
  @IsNumber()
  pourcentageParts?: number;

  @IsOptional()
  @IsString()
  emailCosignataire?: string;

  @IsOptional()
  @IsString()
  telephoneCosignataire?: string;
}

export class UpdateCosignataireDto {
  @IsOptional()
  @IsEnum(['PRINCIPAL', 'SECONDARY'])
  roleType?: 'PRINCIPAL' | 'SECONDARY';

  @IsOptional()
  @IsNumber()
  pourcentageParts?: number;

  @IsOptional()
  @IsEnum(['ENVOYE', 'ACCEPTE', 'REFUSE'])
  statutInvitation?: 'ENVOYE' | 'ACCEPTE' | 'REFUSE';

  @IsOptional()
  signatureElectronique?: boolean;

  @IsOptional()
  signatureDate?: Date;
}

export class CosignataireResponseDto {
  id: string;
  contratId: string;
  cosignataireId: string;
  typeCosignataire: 'UTILISATEUR' | 'ENTREPRISE';
  roleType: 'PRINCIPAL' | 'SECONDARY';
  pourcentageParts: number | null;
  statutInvitation: 'ENVOYE' | 'ACCEPTE' | 'REFUSE';
  dateInvitation: Date;
  dateReponse: Date | null;
  signatureElectronique: boolean;
  signatureDate: Date | null;
  emailCosignataire: string | null;
  telephoneCosignataire: string | null;
  dateCreation: Date;
  dateMaj: Date;
  createdBy: string | null;
  updatedBy: string | null;
  tenantId: string | null;
} 