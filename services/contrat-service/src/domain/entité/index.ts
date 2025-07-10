// === ENTITÉS MÉTIER PRINCIPALES ===
export { Contrat } from './contrat';
export { User } from './user';

// === ENTITÉS D'AUDIT ET HISTORIQUE ===
export { ContratAudit } from './contratAudit';
export type { AuditAction, AuditDetails } from './contratAudit';

export { ContratCompteurHistorique } from './contratCompteurHistorique';
export type { CompteurActionType } from './contratCompteurHistorique';

// === ENTITÉS DE GESTION ===
export { Cosignataire } from './cosignataire';
export type { CosignataireType, CosignataireRole, CosignataireStatut } from './cosignataire'; 