import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { clientService } from '@/services/client.service';
import type { 
  Client, 
  CreateClientRequest, 
  ListClientsRequest, 
  ListClientsResponse 
} from '@/types/client.types';

export const useClientStore = defineStore('client', () => {
  // State
  const clients = ref<Client[]>([]);
  const currentClient = ref<Client | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Getters
  const getClients = computed(() => clients.value);
  const getCurrentClient = computed(() => currentClient.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  const getPagination = computed(() => pagination.value);

  // Actions
  const listClients = async (params: ListClientsRequest = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response: ListClientsResponse = await clientService.list(params);
      clients.value = response.clients;
      pagination.value = {
        total: Number(response.total),
        page: Number(response.page),
        limit: Number(response.limit),
        totalPages: Number(response.totalPages)
      };
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération des clients';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createClient = async (clientData: CreateClientRequest) => {
    loading.value = true;
    error.value = null;
    
    try {
      const newClient = await clientService.create(clientData);
      clients.value.unshift(newClient);
      return newClient;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création du client';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getClientById = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const client = await clientService.getById(id);
      currentClient.value = client;
      return client;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération du client';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateClient = async (id: string, clientData: Partial<CreateClientRequest>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedClient = await clientService.update(id, clientData);
      const index = clients.value.findIndex(c => c.id === id);
      if (index !== -1) {
        clients.value[index] = updatedClient;
      }
      if (currentClient.value?.id === id) {
        currentClient.value = updatedClient;
      }
      return updatedClient;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour du client';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteClient = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      await clientService.delete(id);
      clients.value = clients.value.filter(c => c.id !== id);
      if (currentClient.value?.id === id) {
        currentClient.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression du client';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearCurrentClient = () => {
    currentClient.value = null;
  };

  return {
    // State
    clients,
    currentClient,
    loading,
    error,
    pagination,
    
    // Getters
    getClients,
    getCurrentClient,
    isLoading,
    getError,
    getPagination,
    
    // Actions
    listClients,
    createClient,
    getClientById,
    updateClient,
    deleteClient,
    clearError,
    clearCurrentClient
  };
}); 