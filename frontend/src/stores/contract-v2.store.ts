import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import contractV2Api from '@/services/api/contract-v2.service';
import { useNotificationStore } from './notification.store';
import { useAuthStore } from './auth.store';
import type { ContractV2, TemplateV2, ContractHistoryItem } from '@/types/contract-v2.types';

export const useContractV2Store = defineStore('contractV2', () => {
  const notificationStore = useNotificationStore();
  const authStore = useAuthStore();
  
  // État
  const contracts = ref<ContractV2[]>([]);
  const templates = ref<TemplateV2[]>([]);
  const currentContract = ref<ContractV2 | null>(null);
  const currentTemplate = ref<TemplateV2 | null>(null);
  const contractHistory = ref<ContractHistoryItem[]>([]);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // États de chargement
  const isLoadingContracts = ref(false);
  const isLoadingTemplates = ref(false);
  const isLoadingContract = ref(false);
  const isLoadingTemplate = ref(false);
  const isLoadingHistory = ref(false);
  const isSubmitting = ref(false);
  
  // États d'erreur
  const contractsError = ref<string | null>(null);
  const templatesError = ref<string | null>(null);
  const contractError = ref<string | null>(null);
  const templateError = ref<string | null>(null);
  const historyError = ref<string | null>(null);
  const submitError = ref<string | null>(null);
  
  // Getters
  const hasPermission = computed(() => {
    return authStore.hasPermission('CONTRACTS_MANAGE');
  });
  
  const getTemplates = computed(() => templates.value);
  const getContracts = computed(() => contracts.value);
  const getPagination = computed(() => pagination.value);
  
  // Helper function pour les notifications
  const notify = (notification: { type: 'success' | 'error' | 'warning' | 'info', title: string, text?: string }) => {
    const { type, title, text } = notification;
    if (type === 'success') {
      notificationStore.success(title, text);
    } else if (type === 'error') {
      notificationStore.error(title, text);
    } else if (type === 'warning') {
      notificationStore.warning(title, text);
    } else {
      notificationStore.info(title, text);
    }
  };
  
  // Actions
  async function listContracts(filters = {}) {
    isLoadingContracts.value = true;
    contractsError.value = null;
    
    try {
      console.log('Récupération des contrats...');
      // Utiliser directement l'API de debug qui semble fonctionner pour les templates
      const response = await contractV2Api.debugListContracts(filters);
      console.log('Réponse brute de l\'API:', response);
      
      // Adapter pour la structure de réponse du debug endpoint
      if (response && response.success && response.data) {
        console.log('Structure de réponse avec success et data:', response.data);
        contracts.value = response.data;
        // Mettre à jour la pagination
        const total = response.data.length;
        const limit = filters.limit || 10;
        const page = filters.page || 1;
        pagination.value = {
          page: Number(page),
          limit: Number(limit),
          total: total,
          totalPages: Math.ceil(total / Number(limit))
        };
      } else if (Array.isArray(response)) {
        contracts.value = response;
        // Mettre à jour la pagination pour un tableau simple
        const total = response.length;
        const limit = filters.limit || 10;
        const page = filters.page || 1;
        pagination.value = {
          page: Number(page),
          limit: Number(limit),
          total: total,
          totalPages: Math.ceil(total / Number(limit))
        };
      } else if (response && response.items) {
        contracts.value = response.items;
        // Utiliser la pagination fournie par l'API si disponible
        pagination.value = {
          page: Number(filters.page || 1),
          limit: Number(filters.limit || 10),
          total: response.total || contracts.value.length,
          totalPages: response.totalPages || Math.ceil((response.total || contracts.value.length) / Number(filters.limit || 10))
        };
      } else {
        contracts.value = [];
        // Réinitialiser la pagination
        pagination.value = {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        };
      }
      console.log(`${contracts.value.length} contrats récupérés`);
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des contrats:', error);
      
      // Gestion spécifique des erreurs
      if (error.code === 'ECONNABORTED') {
        contractsError.value = 'La requête a pris trop de temps. Veuillez réessayer.';
        notify({
          type: 'error',
          title: 'Timeout',
          text: 'La requête a pris trop de temps. Veuillez réessayer.'
        });
      } else if (error.response?.status === 500) {
        contractsError.value = 'Erreur serveur. Veuillez réessayer plus tard.';
        notify({
          type: 'error',
          title: 'Erreur serveur',
          text: 'Une erreur est survenue lors de la récupération des contrats. Veuillez réessayer plus tard.'
        });
      } else {
        contractsError.value = error.message || 'Une erreur est survenue';
        notify({
          type: 'error',
          title: 'Erreur',
          text: error.message || 'Une erreur est survenue lors de la récupération des contrats'
        });
      }
      
      return { items: [], total: 0 };
    } finally {
      isLoadingContracts.value = false;
    }
  }
  
  async function getContractById(id: string) {
    isLoadingContract.value = true;
    contractError.value = null;
    
    try {
      console.log(`Récupération du contrat ${id}...`);
      const response = await contractV2Api.getContractById(id);
      currentContract.value = response;
      console.log('Contrat récupéré:', response);
      return response;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération du contrat ${id}:`, error);
      
      contractError.value = error.message || 'Une erreur est survenue';
      notify({
        type: 'error',
        title: 'Erreur',
        text: `Impossible de récupérer le contrat: ${error.message || 'Erreur inconnue'}`
      });
      
      return null;
    } finally {
      isLoadingContract.value = false;
    }
  }
  
  async function createContract(contractData: any) {
    isSubmitting.value = true;
    submitError.value = null;
    
    try {
      console.log('Création du contrat:', contractData);
      const response = await contractV2Api.createContract(contractData);
      notify({
        type: 'success',
        title: 'Succès',
        text: 'Le contrat a été créé avec succès'
      });
      console.log('Contrat créé:', response);
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la création du contrat:', error);
      
      submitError.value = error.message || 'Une erreur est survenue';
      notify({
        type: 'error',
        title: 'Erreur',
        text: `Impossible de créer le contrat: ${error.message || 'Erreur inconnue'}`
      });
      
      return null;
    } finally {
      isSubmitting.value = false;
    }
  }
  
  async function listTemplates() {
    isLoadingTemplates.value = true;
    templatesError.value = null;
    
    try {
      console.log('Récupération des templates...');
      const response = await contractV2Api.listTemplates();
      templates.value = response || [];
      console.log(`${templates.value.length} templates récupérés`);
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des templates:', error);
      
      // Gestion spécifique des erreurs
      if (error.code === 'ECONNABORTED') {
        templatesError.value = 'La requête a pris trop de temps. Veuillez réessayer.';
        notify({
          type: 'error',
          title: 'Timeout',
          text: 'La requête a pris trop de temps. Veuillez réessayer.'
        });
      } else if (error.response?.status === 500) {
        templatesError.value = 'Erreur serveur. Veuillez réessayer plus tard.';
        notify({
          type: 'error',
          title: 'Erreur serveur',
          text: 'Une erreur est survenue lors de la récupération des templates. Veuillez réessayer plus tard.'
        });
      } else {
        templatesError.value = error.message || 'Une erreur est survenue';
        notify({
          type: 'error',
          title: 'Erreur',
          text: error.message || 'Une erreur est survenue lors de la récupération des templates'
        });
      }
      
      return [];
    } finally {
      isLoadingTemplates.value = false;
    }
  }
  
  async function getTemplateById(id: string) {
    isLoadingTemplate.value = true;
    templateError.value = null;
    
    try {
      console.log(`Récupération du template ${id}...`);
      const response = await contractV2Api.getTemplateById(id);
      currentTemplate.value = response;
      console.log('Template récupéré:', response);
      return response;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération du template ${id}:`, error);
      
      templateError.value = error.message || 'Une erreur est survenue';
      notify({
        type: 'error',
        title: 'Erreur',
        text: `Impossible de récupérer le template: ${error.message || 'Erreur inconnue'}`
      });
      
      return null;
    } finally {
      isLoadingTemplate.value = false;
    }
  }
  
  async function createTemplate(templateData: any) {
    isSubmitting.value = true;
    submitError.value = null;
    
    try {
      console.log('Création du template:', templateData);
      const response = await contractV2Api.createTemplate(templateData);
      notify({
        type: 'success',
        title: 'Succès',
        text: 'Le template a été créé avec succès'
      });
      console.log('Template créé:', response);
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la création du template:', error);
      
      submitError.value = error.message || 'Une erreur est survenue';
      notify({
        type: 'error',
        title: 'Erreur',
        text: `Impossible de créer le template: ${error.message || 'Erreur inconnue'}`
      });
      
      return null;
    } finally {
      isSubmitting.value = false;
    }
  }
  
  async function updateTemplate(id: string, templateData: any) {
    isSubmitting.value = true;
    submitError.value = null;
    
    try {
      console.log(`Mise à jour du template ${id}:`, templateData);
      const response = await contractV2Api.updateTemplate(id, templateData);
      notify({
        type: 'success',
        title: 'Succès',
        text: 'Le template a été mis à jour avec succès'
      });
      console.log('Template mis à jour:', response);
      return response;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du template ${id}:`, error);
      
      submitError.value = error.message || 'Une erreur est survenue';
      notify({
        type: 'error',
        title: 'Erreur',
        text: `Impossible de mettre à jour le template: ${error.message || 'Erreur inconnue'}`
      });
      
      return null;
    } finally {
      isSubmitting.value = false;
    }
  }
  
  async function deleteTemplate(id: string) {
    isSubmitting.value = true;
    submitError.value = null;
    
    try {
      console.log(`Suppression du template ${id}...`);
      await contractV2Api.deleteTemplate(id);
      notify({
        type: 'success',
        title: 'Succès',
        text: 'Le template a été supprimé avec succès'
      });
      
      // Mettre à jour la liste des templates
      templates.value = templates.value.filter(t => t.id !== id);
      
      return true;
    } catch (error: any) {
      console.error(`Erreur lors de la suppression du template ${id}:`, error);
      
      submitError.value = error.message || 'Une erreur est survenue';
      notify({
        type: 'error',
        title: 'Erreur',
        text: `Impossible de supprimer le template: ${error.message || 'Erreur inconnue'}`
      });
      
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }
  
  async function getContractHistory(id: string) {
    isLoadingHistory.value = true;
    historyError.value = null;
    
    try {
      console.log(`Récupération de l'historique du contrat ${id}...`);
      const response = await contractV2Api.getContractHistory(id);
      contractHistory.value = response || [];
      console.log(`${contractHistory.value.length} entrées d'historique récupérées`);
      return response;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération de l'historique du contrat ${id}:`, error);
      
      historyError.value = error.message || 'Une erreur est survenue';
      notify({
        type: 'error',
        title: 'Erreur',
        text: `Impossible de récupérer l'historique du contrat: ${error.message || 'Erreur inconnue'}`
      });
      
      return [];
    } finally {
      isLoadingHistory.value = false;
    }
  }
  
  // Récupérer les contrats v2 d'un client spécifique
  const fetchClientContractsV2 = async (clientId: string) => {
    if (!clientId) return [];
    
    isLoadingContracts.value = true;
    contractsError.value = null;
    
    try {
      // Récupère tous les contrats v2
      const response = await contractV2Api.listContracts();
      // Filtre les contrats pour ce client spécifique
      const allContracts = response?.items || [];
      return allContracts.filter(contract => contract.clientId === clientId);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des contrats v2 du client:', error);
      contractsError.value = error?.message || 'Impossible de récupérer les contrats v2 du client';
      // Silencer l'erreur pour l'utilisateur final car c'est une fonctionnalité secondaire
      // notify('error', 'Erreur', 'Impossible de récupérer les contrats v2 du client');
      return [];
    } finally {
      isLoadingContracts.value = false;
    }
  };
  
  // Méthodes de diagnostic
  const diagnoseService = async () => {
    try {
      console.log('Diagnostic du service contract-v2...');
      const pingResponse = await contractV2Api.pingService();
      console.log('Ping response:', pingResponse);
      
      return {
        success: true,
        message: 'Service contract-v2 accessible',
        data: pingResponse
      };
    } catch (error: any) {
      console.error('Erreur lors du diagnostic du service contract-v2:', error);
      
      return {
        success: false,
        message: `Service contract-v2 inaccessible: ${error.message || 'Erreur inconnue'}`,
        error
      };
    }
  };
  
  const debugListTemplates = async () => {
    try {
      console.log('Debug: Récupération des templates...');
      const response = await contractV2Api.debugListTemplates();
      console.log('Debug templates response:', response);
      
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      console.error('Debug: Erreur lors de la récupération des templates:', error);
      
      return {
        success: false,
        message: `Erreur: ${error.message || 'Erreur inconnue'}`,
        error
      };
    }
  };

  // Action pour signer un contrat v2
  const signContract = async (id: string) => {
    try {
      isSubmitting.value = true; // Use isSubmitting for loading state
      await contractV2Api.sign(id);
      await getContractById(id); // Recharger les données après signature
      notify({
        type: 'success',
        title: 'Succès',
        text: 'Contrat signé avec succès'
      });
    } catch (err: any) {
      submitError.value = err.message || 'Erreur lors de la signature du contrat';
      notify({
        type: 'error',
        title: 'Erreur',
        text: submitError.value
      });
      throw err;
    } finally {
      isSubmitting.value = false;
    }
  };

  // Action pour résilier un contrat v2
  const terminateContract = async (id: string, reason?: string) => {
    try {
      isSubmitting.value = true; // Use isSubmitting for loading state
      await contractV2Api.terminate(id, reason);
      await getContractById(id); // Recharger les données après résiliation
      notify({
        type: 'success',
        title: 'Succès',
        text: 'Contrat résilié avec succès'
      });
    } catch (err: any) {
      submitError.value = err.message || 'Erreur lors de la résiliation du contrat';
      notify({
        type: 'error',
        title: 'Erreur',
        text: submitError.value
      });
      throw err;
    } finally {
      isSubmitting.value = false;
    }
  };
  
  return {
    // État
    contracts,
    templates,
    currentContract,
    currentTemplate,
    contractHistory,
    pagination,
    
    // États de chargement
    isLoadingContracts,
    isLoadingTemplates,
    isLoadingContract,
    isLoadingTemplate,
    isLoadingHistory,
    isSubmitting,
    
    // États d'erreur
    contractsError,
    templatesError,
    contractError,
    templateError,
    historyError,
    submitError,
    
    // Getters
    hasPermission,
    getTemplates,
    getContracts,
    getPagination,
    
    // Actions
    listContracts,
    getContractById,
    createContract,
    listTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getContractHistory,
    fetchClientContractsV2,
    signContract,
    terminateContract,
    
    // Diagnostic
    diagnoseService,
    debugListTemplates
  };
});
