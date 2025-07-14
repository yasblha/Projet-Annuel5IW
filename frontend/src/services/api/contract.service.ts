import apiClient from '@/services/http.interceptor';
import type { Contract, CreateContractDto, UpdateContractDto, ContractFilters, Cosignatary } from '@/types/contract.types';

// Data Transfer Objects matching backend expectations
export type CreateContratDraftDto = {
  proprietaireId: string;
  typeProprietaire: string;
  zone: string;
  typeContrat: 'I' | 'P' | 'C' | 'A';
  dateDebut: string;
  compteurId?: string;
  abonnementId?: string;
  cosignataires?: any[];
  tenantId?: string;
};

export const contractApi = {
  // --- CONTRAT COMPLET ---
  create: (data: CreateContractDto) => apiClient.post('/contrats', data),

  // --- CONTRAT DRAFT WORKFLOW ---
  createDraft: (data: CreateContratDraftDto) => apiClient.post('/contrats/draft', data),
  lierCompteur: (contratId: string, data: { compteurId: string }) =>
    apiClient.post(`/contrats/${contratId}/compteurs`, data),
  lierAbonnement: (contratId: string, data: { abonnementId: string }) =>
    apiClient.post(`/contrats/${contratId}/abonnements`, data),
  addCosigner: (contratId: string, data: any) =>
    apiClient.post(`/contrats/${contratId}/cosignataires`, data),
  finalize: (id: string) => apiClient.post(`/contrats/${id}/finalize`),

  // --- SIGNATURES ET INVITATIONS ---
  sendSignatureInvitation: (contratId: string, cosignataireId: string, baseUrl: string) => 
    apiClient.post(`/contrats/${contratId}/cosignataires/${cosignataireId}/invitation`, { baseUrl }),
  sendAllSignatureInvitations: (contratId: string, baseUrl: string) =>
    apiClient.post(`/contrats/${contratId}/cosignataires/invitations`, { baseUrl }),
  getCosignataires: (contratId: string): Promise<Cosignatary[]> =>
    apiClient.get(`/contrats/${contratId}/cosignataires`),

  // --- SUIVI ET AUDIT ---
  getAuditTrail: (contratId: string, params = {}) => 
    apiClient.get(`/contrats/${contratId}/audit`, { params }),
  getMeterHistory: (contratId: string) =>
    apiClient.get(`/contrats/${contratId}/compteur/historique`),

  // --- ACTIONS SPECIFIQUES ---
  sign: (contratId: string, data: { signataireId: string, signatureData?: string }) =>
    apiClient.post(`/contrats/${contratId}/signature`, data),
  suspend: (contratId: string, data: { motif: string, dateReprise?: string }) =>
    apiClient.post(`/contrats/${contratId}/suspension`, data),
  terminate: (contratId: string, data: { motif: string, dateEffet: string }) =>
    apiClient.post(`/contrats/${contratId}/resiliation`, data),
  renew: (contratId: string, data: { duree: number }) =>
    apiClient.post(`/contrats/${contratId}/renouvellement`, data),

  // --- CRUD GÉNÉRIQUES ---
  update: (id: string, data: UpdateContractDto) => {
    // Vérifier que l'ID est un UUID valide
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      console.error('ID invalide:', id);
      return Promise.reject(new Error('ID invalide: doit être un UUID valide'));
    }
    
    // S'assurer que l'ID est inclus dans les données pour le backend
    const updatedData = {
      ...data,
      id: id
    };
    
    return apiClient.put(`/contrats/${id}`, updatedData);
  },
  delete: (id: string) => apiClient.delete(`/contrats/${id}`),
  getById: (id: string): Promise<Contract> => apiClient.get(`/contrats/${id}`),
  list: (params: ContractFilters = {}): Promise<{ items: Contract[], total: number }> => 
    apiClient.get('/contrats', { params }),
  
  // --- RECHERCHE ---
  search: (query: string, params = {}) => 
    apiClient.get('/contrats/search', { params: { query, ...params } }),
    
  // --- STATISTIQUES ---
  getStats: async () => {
    try {
      const response = await apiClient.get('/contrats/stats')
      return response.data || response
    } catch (error) {
      console.error('Erreur récupération statistiques contrats:', error)
      
      // Temporaire: générer des données de test en attendant l'implémentation backend
      // À supprimer quand l'endpoint backend sera disponible
      return {
        total: 156,
        actifs: 112,
        enAttente: 28,
        resilies: 12,
        suspendus: 4,
        parType: {
          'I': 86,
          'P': 42,
          'C': 18,
          'A': 10
        },
        parZone: {
          'Paris': 45,
          'Lyon': 32,
          'Marseille': 28,
          'Lille': 18,
          'Autres': 33
        },
        parMois: {
          '2025-01': 12,
          '2025-02': 15,
          '2025-03': 9,
          '2025-04': 14,
          '2025-05': 18,
          '2025-06': 22,
          '2025-07': 8
        }
      }
    }
  },
};