import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { contractApi } from '@/services/api/contract.service';
import { clientApi } from '@/services/api/client.service';
import { useNotificationStore } from './notification.store';

export const useAnalyticsStore = defineStore('analytics', () => {
  const notificationStore = useNotificationStore();
  
  // État
  const contractStats = ref({
    total: 0,
    actifs: 0,
    enAttente: 0,
    resilies: 0,
    suspendus: 0,
    parType: {},
    parZone: {},
    parMois: {}
  });
  
  const clientStats = ref({
    total: 0,
    particuliers: 0,
    entreprises: 0,
    collectivites: 0,
    nouveauxParMois: {}
  });
  
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const fetchContractStats = async () => {
    loading.value = true;
    error.value = null;
    try {
      // Récupérer les statistiques des contrats
      const response = await contractApi.getStats();
      contractStats.value = response.data || response;
      return contractStats.value;
    } catch (err) {
      error.value = err.message || 'Erreur lors de la récupération des statistiques des contrats';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Récupérer les contrats par client
  const fetchClientContracts = async (clientId) => {
    loading.value = true;
    error.value = null;
    try {
      // Utiliser l'API des contrats pour filtrer par propriétaireId
      const response = await contractApi.list({ proprietaireId: clientId });
      return response.items || response;
    } catch (err) {
      error.value = err.message || 'Erreur lors de la récupération des contrats du client';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Récupérer la consommation d'un compteur
  const fetchMeterConsumption = async (meterId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await contractApi.getMeterHistory(meterId);
      return response || [];
    } catch (err) {
      error.value = err.message || 'Erreur lors de la récupération de la consommation';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    contractStats,
    clientStats,
    loading,
    error,
    fetchContractStats,
    fetchClientContracts,
    fetchMeterConsumption
  };
});
