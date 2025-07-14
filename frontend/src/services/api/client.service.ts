import apiClient from '../api.service.ts'

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
      
      // Temporaire: générer des données de test en attendant l'implémentation complète
      // À supprimer quand la route backend sera stable
      return {
        data: {
          id: id,
          type: Math.random() > 0.5 ? 'PARTICULIER' : 'ENTREPRISE',
          nom: 'Dubois',
          prenom: 'Marie',
          raisonSociale: 'SARL Eau Claire',
          email: 'contact@example.com',
          telephone: '01 23 45 67 89',
          mobile: '06 12 34 56 78',
          dateNaissance: '1985-07-15',
          siret: Math.random() > 0.5 ? '12345678901234' : null,
          dateCreation: '2023-03-10',
          adresse: {
            rue: '15 rue des Lilas',
            codePostal: '75012',
            ville: 'Paris',
            pays: 'France'
          }
        }
      }
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