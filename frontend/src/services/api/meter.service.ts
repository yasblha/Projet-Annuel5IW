import apiClient from '@/services/api.service';

/**
 * Service pour gérer les compteurs
 */
export const meterApi = {
  /**
   * Scanner un compteur par son numéro de série
   * @param serial Numéro de série du compteur à scanner
   */
  scan: async (serial: string) => {
    try {
      // Appel réel à l'API pour scanner un compteur par son numéro
      const response = await apiClient.get(`/contrat-service/compteur/scan/${encodeURIComponent(serial)}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du scan du compteur:', error);
      throw error;
    }
  },
  
  /**
   * Récupère tous les compteurs avec filtres optionnels
   * @param filters Filtres optionnels (page, limit, search, etc.)
   * @returns Liste des compteurs
   */
  getAll: async (filters = '') => {
    try {
      const response = await apiClient.get(`/compteurs${filters ? `?${filters}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des compteurs:', error);
      
      // En développement, retourner des données fictives
      if (process.env.NODE_ENV !== 'production') {
        return {
          success: true,
          items: [
            {
              id: 'meter-1',
              serial: 'MTR-12345',
              type: 'EAU_POTABLE',
              dateInstallation: '2023-01-15',
              valeurDernierReleve: 120,
              dateDernierReleve: '2023-06-01',
              statut: 'ACTIF',
              description: 'Compteur principal'
            },
            {
              id: 'meter-2',
              serial: 'MTR-67890',
              type: 'EAU_POTABLE',
              dateInstallation: '2023-02-20',
              valeurDernierReleve: 85,
              dateDernierReleve: '2023-06-05',
              statut: 'ACTIF',
              description: 'Compteur secondaire'
            }
          ],
          total: 2,
          page: 1,
          limit: 10
        };
      }
      
      throw error;
    }
  },
  
  /**
   * Récupère un compteur par son ID
   * @param id ID du compteur
   * @returns Détails du compteur
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/compteurs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du compteur ${id}:`, error);
      
      // En développement, retourner des données fictives
      if (process.env.NODE_ENV !== 'production') {
        return {
          success: true,
          data: {
            id,
            serial: `MTR-${id.slice(-5)}`,
            type: 'EAU_POTABLE',
            dateInstallation: '2023-01-15',
            valeurDernierReleve: 120,
            dateDernierReleve: '2023-06-01',
            statut: 'ACTIF',
            description: 'Compteur principal'
          }
        };
      }
      
      throw error;
    }
  },
  
  /**
   * Récupère l'historique des relevés d'un compteur
   * @param id ID du compteur
   * @returns Historique des relevés
   */
  getReadings: async (id) => {
    try {
      const response = await apiClient.get(`/compteurs/${id}/releves`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des relevés du compteur ${id}:`, error);
      
      // En développement, retourner des données fictives
      if (process.env.NODE_ENV !== 'production') {
        return {
          success: true,
          data: [
            { date: '2023-01-01', value: 0 },
            { date: '2023-02-01', value: 15 },
            { date: '2023-03-01', value: 45 },
            { date: '2023-04-01', value: 75 },
            { date: '2023-05-01', value: 95 },
            { date: '2023-06-01', value: 120 }
          ]
        };
      }
      
      throw error;
    }
  },
  
  /**
   * Génère un compteur virtuel associé à un contrat
   * @param data Données pour la génération (contratId, nombre, etc.)
   */
  generateVirtualMeter: async (data) => {
    try {
      // Utiliser le bon endpoint pour la génération de compteurs virtuels
      const response = await apiClient.post('/contrat-service/compteur/generer', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du compteur virtuel:', error);
      throw error; // Ne pas masquer l'erreur pour permettre une meilleure gestion
    }
  },
  
  /**
   * Génère des compteurs de test et les associe aux contrats
   */
  generateTestMeters: async () => {
    try {
      const response = await apiClient.post('/compteurs/generate-test-data', {});
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération de compteurs de test:', error);
      // En cas d'erreur, on retourne un message d'erreur
      return {
        success: false,
        message: 'Impossible de générer les compteurs de test',
        error
      };
    }
  }
}