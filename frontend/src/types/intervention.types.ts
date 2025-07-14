export interface CreateInterventionDto {
  contratId: string
  type: 'INSTALLATION' | 'REPARATION' | 'RELEVE'
  datePlanifiee: string
  technicienId?: string
  description?: string
  priorite?: 'HAUTE' | 'MOYENNE' | 'BASSE'
  tenantId?: string
  compteurId?: string
}

export interface FinishInterventionDto {
  resultat?: string
  cout?: number
  notes?: string
  compteurId?: string
  numeroSerie?: string
  photos?: string[]
}

export interface Intervention {
  id: string
  contratId: string
  type: 'INSTALLATION' | 'REPARATION' | 'RELEVE'
  statut: InterventionStatus
  datePlanifiee: string
  technicienId?: string
  dateFinIntervention?: string
  resultat?: string
  cout?: number
  description?: string
  priorite?: 'HAUTE' | 'MOYENNE' | 'BASSE'
  compteurId?: string
  createdAt?: string
  updatedAt?: string
}

export enum InterventionStatus {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE'
}

export interface InterventionFilters {
  contratId?: string
  technicienId?: string
  statut?: InterventionStatus | InterventionStatus[]
  type?: string
  datePlanifieeFrom?: string
  datePlanifieeTo?: string
  search?: string
  page?: number
  limit?: number
  sort?: string
}
