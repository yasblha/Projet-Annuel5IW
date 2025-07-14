import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { contractApi } from '@/services/api/contract.service';
import type { Contract, ContractStatus, ContractAudit, Cosignatary, ContractFilters } from '@/types/contract.types';
import { useNotificationStore } from './notification.store';

export const useContractStore = defineStore('contract', () => {
  // Stores
  const notificationStore = useNotificationStore();
  
  // State
  const contracts = ref<Contract[]>([]);
  const currentContract = ref<Contract | null>(null);
  const contractAudit = ref<ContractAudit[]>([]);
  const contractMeters = ref<any[]>([]); // Type à définir selon la structure de données retournée
  const cosignataires = ref<Cosignatary[]>([]);
  const cosignatairesMap = ref<Record<string, Cosignatary[]>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Getters
  const getContracts = computed(() => contracts.value);
  const getCurrentContract = computed(() => currentContract.value);
  const getContractAudit = computed(() => contractAudit.value);
  const getContractMeters = computed(() => contractMeters.value);
  const getCosigners = computed(() => {
    // Si nous avons un contrat courant et son ID, retournons ses cosignataires spécifiques
    if (currentContract.value?.id && cosignatairesMap.value[currentContract.value.id]) {
      return cosignatairesMap.value[currentContract.value.id];
    }
    // Sinon retournons l'ancien état pour compatibilité
    return cosignataires.value;
  });
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  const getPagination = computed(() => pagination.value);

  // Actions
  const listContracts = async (params: ContractFilters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const { page = 1, limit = 10, ...filters } = params;
      const res = await contractApi.list({ page, limit, ...filters });
      contracts.value = res.items || [];
      pagination.value = {
        total: Number(res.total || 0),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((res.total || 0) / Number(limit))
      };
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération des contrats';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createContract = async (contractData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await contractApi.create(contractData);
      notificationStore.success('Succès', 'Contrat créé avec succès');
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création du contrat';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getContractById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await contractApi.getById(id);
      currentContract.value = res.data;
      return res.data;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération du contrat';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateContract = async (id: string, contractData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await contractApi.update(id, contractData);
      // Mettre à jour le contrat courant s'il est chargé
      if (currentContract.value && currentContract.value.id === id) {
        currentContract.value = { ...currentContract.value, ...contractData };
      }
      // Mettre à jour la liste des contrats si elle contient ce contrat
      const index = contracts.value.findIndex(c => c.id === id);
      if (index !== -1) {
        contracts.value[index] = { ...contracts.value[index], ...contractData };
      }
      notificationStore.success('Succès', 'Contrat mis à jour avec succès');
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour du contrat';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteContract = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await contractApi.delete(id);
      // Retirer le contrat de la liste
      contracts.value = contracts.value.filter(c => c.id !== id);
      // Réinitialiser le contrat courant si c'est celui qui vient d'être supprimé
      if (currentContract.value && currentContract.value.id === id) {
        currentContract.value = null;
      }
      notificationStore.success('Succès', 'Contrat supprimé avec succès');
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression du contrat';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Fonctions spécifiques pour les cosignataires
  const fetchCosignataires = async (contractId: string) => {
    loading.value = true;
    error.value = null;
    try {
      console.log('[Contract Store] Chargement des cosignataires pour', contractId);
      const res = await contractApi.getCosignataires(contractId);
      
      // Stocker dans la map par ID
      cosignatairesMap.value[contractId] = res;
      
      // Maintenir la compatibilité avec l'ancien code
      if (currentContract.value && currentContract.value.id === contractId) {
        cosignataires.value = res;
      }
      
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération des cosignataires';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const sendSignatureInvitation = async (contractId: string, cosignataireId: string, baseUrl: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await contractApi.sendSignatureInvitation(contractId, cosignataireId, baseUrl);
      notificationStore.success('Invitation envoyée', 'L\'invitation à signer a été envoyée avec succès');
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'envoi de l\'invitation';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const sendAllSignatureInvitations = async (contractId: string, baseUrl: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await contractApi.sendAllSignatureInvitations(contractId, baseUrl);
      notificationStore.success('Invitations envoyées', 'Les invitations à signer ont été envoyées avec succès');
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'envoi des invitations';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Nouvelles fonctions pour l'audit et l'historique
  const fetchAuditTrail = async (contractId: string, params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await contractApi.getAuditTrail(contractId, params);
      // Vérifier le format de la réponse et traiter en conséquence
      if (Array.isArray(res)) {
        // Si la réponse est un tableau, l'affecter directement
        contractAudit.value = res;
        return {
          items: res,
          total: res.length
        };
      } else if (res && typeof res === 'object') {
        // Si c'est un objet avec items et total
        contractAudit.value = res.items || res;
        return res;
      }
      return { items: [], total: 0 };
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération de l\'historique d\'audit';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchMeterHistory = async (contractId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await contractApi.getMeterHistory(contractId);
      contractMeters.value = res;
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération de l\'historique des compteurs';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actions spécifiques sur les contrats
  const signContract = async (contractId: string, userId: string) => {
    try {
      loading.value = true;
      const response = await contractApi.sign(contractId, { signataireId: userId });
      loading.value = false;
      notificationStore.success('Succès', 'Contrat signé avec succès');

      // Recharger les données du contrat pour refléter le nouveau statut
      await getContractById(contractId);
      await fetchCosignataires(contractId);
      
      return response;
    } catch (error) {
      loading.value = false;
      notificationStore.error('Erreur', 'Erreur lors de la signature du contrat');
      console.error('Erreur de signature:', error);
      throw error;
    }
  };

  const terminateContract = async (contractId: string, data: { motifResiliation: string, dateResiliation?: Date, commentaire?: string }) => {
    try {
      loading.value = true;
      const response = await contractApi.terminate(contractId, {
        motif: data.motifResiliation,
        dateEffet: data.dateResiliation ? new Date(data.dateResiliation).toISOString() : new Date().toISOString(),
        commentaire: data.commentaire
      });
      loading.value = false;
      notificationStore.success('Succès', 'Contrat résilié avec succès');

      // Recharger les données du contrat pour refléter le nouveau statut
      await getContractById(contractId);
      
      return response;
    } catch (error) {
      loading.value = false;
      notificationStore.error('Erreur', 'Erreur lors de la résiliation du contrat');
      console.error('Erreur de résiliation:', error);
      throw error;
    }
  };

  const suspendContract = async (contractId: string, motif: string, dateReprise?: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await contractApi.suspend(contractId, { motif, dateReprise });
      if (currentContract.value && currentContract.value.id === contractId) {
        currentContract.value.status = ContractStatus.SUSPENDED;
      }
      notificationStore.success('Contrat suspendu', 'Le contrat a été suspendu avec succès');
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suspension du contrat';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const renewContract = async (contractId: string, duree: number) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await contractApi.renew(contractId, { duree });
      // Recharger le contrat pour obtenir les nouvelles dates
      if (currentContract.value && currentContract.value.id === contractId) {
        await getContractById(contractId);
      }
      notificationStore.success('Contrat renouvelé', 'Le contrat a été renouvelé avec succès');
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du renouvellement du contrat';
      notificationStore.error('Erreur', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearCurrentContract = () => {
    currentContract.value = null;
    contractAudit.value = [];
    contractMeters.value = [];
    cosignataires.value = [];
    // Ne pas vider cosignatairesMap pour conserver le cache
  };

  return {
    // State
    contracts,
    currentContract,
    contractAudit,
    contractMeters,
    cosignataires,
    cosignatairesMap,
    loading,
    error,
    pagination,

    // Getters
    getContracts,
    getCurrentContract,
    getContractAudit,
    getContractMeters,
    getCosigners,
    isLoading,
    getError,
    getPagination,

    // Actions
    listContracts,
    createContract,
    getContractById,
    updateContract,
    deleteContract,
    fetchCosignataires,
    sendSignatureInvitation,
    sendAllSignatureInvitations,
    fetchAuditTrail,
    fetchMeterHistory,
    signContract,
    terminateContract,
    suspendContract,
    renewContract,
    clearError,
    clearCurrentContract
  };
});