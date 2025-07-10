export class CreateCosignataireDto {
  contratId: string;
  cosignataireId: string;
  typeCosignataire: 'UTILISATEUR' | 'ENTREPRISE';
  roleType?: 'PRINCIPAL' | 'SECONDARY';
  pourcentageParts?: number;
  emailCosignataire?: string;
  telephoneCosignataire?: string;
  tenantId?: string;
  createdBy?: string;
  updatedBy?: string;
}

export class UpdateCosignataireDto {
  roleType?: 'PRINCIPAL' | 'SECONDARY';
  pourcentageParts?: number;
  statutInvitation?: 'ENVOYE' | 'ACCEPTE' | 'REFUSE';
  signatureElectronique?: boolean;
  signatureDate?: Date;
  tenantId?: string;
  updatedBy?: string;
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