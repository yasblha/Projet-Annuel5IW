import apiClient from './api.service'

export const clientApi = {
  // Recherche de clients
  search: async (query: string) => {
    try {
      const response = await apiClient.get('/clients/search', {
        params: { q: query }
      })
      return response
    } catch (error) {
      console.error('Erreur recherche clients:', error)
      throw error
    }
  },

  // Récupérer un client par ID
  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/clients/${id}`)
      return response
    } catch (error) {
      console.error('Erreur récupération client:', error)
      throw error
    }
  },

  // Créer un nouveau client
  create: async (clientData: any) => {
    try {
      const response = await apiClient.post('/clients', clientData)
      return response
    } catch (error) {
      console.error('Erreur création client:', error)
      throw error
    }
  },

  // Mettre à jour un client
  update: async (id: string, clientData: any) => {
    try {
      const response = await apiClient.put(`/clients/${id}`, clientData)
      return response
    } catch (error) {
      console.error('Erreur mise à jour client:', error)
      throw error
    }
  },

  // Supprimer un client
  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/clients/${id}`)
      return response
    } catch (error) {
      console.error('Erreur suppression client:', error)
      throw error
    }
  },

  // Lister tous les clients
  getAll: async (params?: any) => {
    try {
      const response = await apiClient.get('/clients', { params })
      return response
    } catch (error) {
      console.error('Erreur récupération clients:', error)
      throw error
    }
  }
} 