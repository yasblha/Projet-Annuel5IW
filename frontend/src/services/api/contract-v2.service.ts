import axios, { AxiosError } from 'axios';
import apiClient from '@/services/http.interceptor';
import type { Contract } from '@/types/contract.types';

// Fonction utilitaire pour les retries avec backoff exponentiel
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  shouldRetry: (error: any) => boolean = (error) => {
    // Par défaut, on retry sur les erreurs 500 et les timeouts
    if (axios.isAxiosError(error)) {
      return error.response?.status === 500 || error.code === 'ECONNABORTED';
    }
    return false;
  }
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Vérifier si on doit réessayer
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Calculer le délai avec backoff exponentiel
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.log(`Tentative ${attempt + 1}/${maxRetries} échouée. Nouvelle tentative dans ${delay}ms...`);
      
      // Attendre avant la prochaine tentative
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Si on arrive ici, c'est que toutes les tentatives ont échoué
  console.error(`Échec après ${maxRetries} tentatives`, lastError);
  throw lastError;
};

// Types spécifiques pour le service contract-v2
export interface ContractV2 {
  id: string;
  clientId: string;
  templateId: string;
  startDate: string;
  endDate?: string;
  status: 'DRAFT' | 'VALIDATED' | 'SIGNED' | 'TERMINATED';
  price: number;
  periodicity: string;
  meterId?: string;
  createdAt: string;
  updatedAt: string;
  agencyId: string;
}

export interface TemplateV2 {
  id: string;
  name: string;
  bodyMd: string;
  periodicity: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractHistoryEntry {
  id: string;
  contractId: string;
  action: 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'METER_UPDATE' | 'PRICE_CHANGE';
  oldValue?: string;
  newValue?: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CreateContractV2Dto {
  clientId: string;
  templateId: string;
  startDate: string;
  endDate?: string;
}

export interface CreateTemplateV2Dto {
  name: string;
  bodyMd: string;
  periodicity: string;
  price: number;
}

export const contractV2Api = {
  // === CRUD CONTRATS ===
  list: (params = {}): Promise<{ items: ContractV2[], total: number }> => 
    retryWithBackoff(() => apiClient.get('/contrats/v2', { 
      params,
      timeout: 10000 // Réduire le timeout à 10 secondes pour éviter l'attente infinie
    }).then(res => res.data)),

  getById: (id: string): Promise<ContractV2> => 
    retryWithBackoff(() => apiClient.get(`/contrats/v2/${id}`).then(res => res.data)),

  create: (data: CreateContractV2Dto): Promise<ContractV2> => 
    retryWithBackoff(() => apiClient.post('/contrats/v2', data).then(res => res.data)),

  // === VALIDATION ET SIGNATURE ===
  validate: (id: string): Promise<ContractV2> => 
    retryWithBackoff(() => apiClient.post(`/contrats/v2/${id}/validate`).then(res => res.data)),

  sign: (id: string): Promise<ContractV2> => 
    retryWithBackoff(() => apiClient.post(`/contrats/v2/${id}/sign`).then(res => res.data)),

  terminate: (id: string, reason?: string): Promise<ContractV2> => 
    retryWithBackoff(() => apiClient.post(`/contrats/v2/${id}/terminate`, { reason }).then(res => res.data)),

  // === GESTION DES COMPTEURS ===
  updateMeter: (id: string, meterId: string): Promise<ContractV2> => 
    retryWithBackoff(() => apiClient.post(`/contrats/v2/${id}/meter`, { meterId }).then(res => res.data)),

  // === TEMPLATES DE CONTRATS ===
  listTemplates: (): Promise<TemplateV2[]> => 
    retryWithBackoff(() => apiClient.get('/contrats/v2/templates').then(res => res.data)),

  getTemplateById: (id: string): Promise<TemplateV2> => 
    retryWithBackoff(() => apiClient.get(`/contrats/v2/templates/${id}`).then(res => res.data)),

  createTemplate: (data: CreateTemplateV2Dto): Promise<TemplateV2> => 
    retryWithBackoff(() => apiClient.post('/contrats/v2/templates', data).then(res => res.data)),

  updateTemplate: (id: string, data: Partial<CreateTemplateV2Dto>): Promise<TemplateV2> => 
    retryWithBackoff(() => apiClient.put(`/contrats/v2/templates/${id}`, data).then(res => res.data)),

  deleteTemplate: (id: string): Promise<void> => 
    retryWithBackoff(() => apiClient.delete(`/contrats/v2/templates/${id}`).then(() => {})),

  // === HISTORIQUE DES CONTRATS ===
  getContractHistory: (id: string): Promise<ContractHistoryEntry[]> => 
    retryWithBackoff(() => apiClient.get(`/contrats/v2/${id}/history`).then(response => response.data)),

  // === GESTION DES CONTRATS PAR CLIENT ===
  // Note: Cette méthode utilise l'endpoint de liste avec un filtre sur le clientId
  // puisqu'il n'y a pas d'endpoint spécifique /contrats/v2/client/{clientId}
  getClientContracts: (clientId: string): Promise<{ data: ContractV2[] }> => 
    apiClient.get(`/contrats/v2`, { params: { clientId } }).then(response => response),

  // === ROUTES DE DEBUG ===
  pingService: (): Promise<any> => 
    apiClient.get('/debug/contrats/v2/ping'),

  debugListTemplates: (): Promise<any> => 
    apiClient.get('/debug/contrats/v2/templates').then(res => res.data),

  debugListContracts: (filters = {}): Promise<any> => 
    apiClient.get('/debug/contrats/v2/contracts', { params: filters }).then(res => res.data),

  // Alias legacy names for backward compatibility
  listContracts(params = {}): Promise<{ items: ContractV2[], total: number }>  {
    // @ts-ignore
    return this.list(params);
  },
  getContractById(id: string): Promise<ContractV2>  {
    // @ts-ignore
    return this.getById(id);
  },
  createContract(data: CreateContractV2Dto): Promise<ContractV2>  {
    // @ts-ignore
    return this.create(data);
  },
} as any;

export default contractV2Api;
