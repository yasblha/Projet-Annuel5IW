import apiService from './api.service';
import type { 
  Client, 
  CreateClientRequest, 
  ListClientsRequest, 
  ListClientsResponse 
} from '@/types/client.types';

class ClientService {
  private readonly baseUrl = '/clients';

  async list(params: ListClientsRequest = {}): Promise<ListClientsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);
    if (params.statut) queryParams.append('statut', params.statut);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    const response = await apiService.get<ListClientsResponse>(url);
    // Correction : conversion des champs page/limit en number si besoin
    const data = response.data;
    return {
      clients: data.clients,
      total: Number(data.total),
      page: Number(data.page),
      limit: Number(data.limit),
      totalPages: Number(data.totalPages)
    };
  }

  async create(clientData: CreateClientRequest): Promise<Client> {
    // Création d'une copie profonde des données pour éviter de modifier l'objet original
    const payload = JSON.parse(JSON.stringify(clientData));
    
    // Vérifier si l'adresse existe et assurer sa compatibilité avec le backend
    if (payload.adresse) {
      // S'assurer que tous les champs requis sont présents
      payload.adresse = {
        ...payload.adresse,
        // Garantir que le backend reçoit les bonnes propriétés
        type: payload.adresse.type || 'PRINCIPALE',
        clientId: payload.adresse.clientId
      };
    }
    
    const response = await apiService.post<Client>(this.baseUrl, payload);
    return response.data;
  }

  async getById(id: string): Promise<Client> {
    const response = await apiService.get<Client>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, clientData: Partial<CreateClientRequest>): Promise<Client> {
    // Création d'une copie profonde des données pour éviter de modifier l'objet original
    const payload = JSON.parse(JSON.stringify(clientData));
    
    // Vérifier si l'adresse existe et assurer sa compatibilité avec le backend
    if (payload.adresse) {
      // S'assurer que tous les champs requis sont présents
      payload.adresse = {
        ...payload.adresse,
        // Garantir que le backend reçoit les bonnes propriétés
        type: payload.adresse.type || 'PRINCIPALE',
        clientId: id
      };
    }
    
    const response = await apiService.put<Client>(`${this.baseUrl}/${id}`, payload);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }
}

export const clientService = new ClientService(); 