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
    const response = await apiService.post<Client>(this.baseUrl, clientData);
    return response.data;
  }

  async getById(id: string): Promise<Client> {
    const response = await apiService.get<Client>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, clientData: Partial<CreateClientRequest>): Promise<Client> {
    const response = await apiService.put<Client>(`${this.baseUrl}/${id}`, clientData);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }
}

export const clientService = new ClientService(); 