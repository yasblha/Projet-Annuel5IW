import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { interventionApi } from '@/services/api/intervention.service'
import type { Intervention, CreateInterventionDto, FinishInterventionDto, InterventionFilters, InterventionStatus } from '@/types/intervention.types'
import { useNotificationStore } from './notification.store'

export const useInterventionStore = defineStore('intervention', () => {
  // Stores
  const notificationStore = useNotificationStore();
  
  // State
  const interventions = ref<Intervention[]>([])
  const currentIntervention = ref<Intervention | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Getters
  const getInterventions = computed(() => interventions.value)
  const getCurrentIntervention = computed(() => currentIntervention.value)
  const isLoading = computed(() => loading.value)
  const getError = computed(() => error.value)
  const getPagination = computed(() => pagination.value)

  // Actions
  const listInterventions = async (params: InterventionFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      const { page = 1, limit = 10, ...filters } = params;
      const res = await interventionApi.list({ page, limit, ...filters })
      interventions.value = res.items || [];
      pagination.value = {
        total: Number(res.total || 0),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((res.total || 0) / Number(limit))
      };
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération des interventions'
      notificationStore.error('Erreur', error.value);
      throw err
    } finally {
      loading.value = false
    }
  }

  const createIntervention = async (dto: CreateInterventionDto) => {
    loading.value = true
    error.value = null
    try {
      const res = await interventionApi.create(dto)
      notificationStore.success('Succès', 'Intervention créée avec succès');
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création de l\'intervention'
      notificationStore.error('Erreur', error.value);
      throw err
    } finally {
      loading.value = false
    }
  }

  const finishIntervention = async (id: string, dto: FinishInterventionDto) => {
    loading.value = true
    error.value = null
    try {
      const res = await interventionApi.finish(id, dto)
      
      // Mise à jour de l'intervention dans la liste
      const idx = interventions.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        interventions.value[idx] = { ...interventions.value[idx], ...res };
      }
      
      // Mise à jour de l'intervention courante si c'est celle-ci
      if (currentIntervention.value?.id === id) {
        currentIntervention.value = { ...currentIntervention.value, ...res };
      }
      
      notificationStore.success('Succès', 'Intervention terminée avec succès');
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la clôture de l\'intervention'
      notificationStore.error('Erreur', error.value);
      throw err
    } finally {
      loading.value = false
    }
  }

  const getInterventionById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await interventionApi.getById(id)
      currentIntervention.value = res
      return res
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération de l\'intervention'
      notificationStore.error('Erreur', error.value);
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const updateInterventionStatus = async (id: string, status: InterventionStatus) => {
    loading.value = true
    error.value = null
    try {
      const res = await interventionApi.updateStatus(id, status)
      
      // Mise à jour de l'intervention dans la liste
      const idx = interventions.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        interventions.value[idx].status = status;
      }
      
      // Mise à jour de l'intervention courante si c'est celle-ci
      if (currentIntervention.value?.id === id) {
        currentIntervention.value.status = status;
      }
      
      notificationStore.success('Succès', `Statut de l'intervention mis à jour`);
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour du statut'
      notificationStore.error('Erreur', error.value);
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const cancelIntervention = async (id: string, reason: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await interventionApi.cancel(id, reason)
      
      // Mise à jour de l'intervention dans la liste
      const idx = interventions.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        interventions.value[idx].status = InterventionStatus.CANCELLED;
        interventions.value[idx].cancelReason = reason;
      }
      
      // Mise à jour de l'intervention courante si c'est celle-ci
      if (currentIntervention.value?.id === id) {
        currentIntervention.value.status = InterventionStatus.CANCELLED;
        currentIntervention.value.cancelReason = reason;
      }
      
      notificationStore.success('Succès', 'Intervention annulée avec succès');
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'annulation de l\'intervention'
      notificationStore.error('Erreur', error.value);
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const getInterventionsByContract = async (contractId: string, params = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await interventionApi.getByContract(contractId, params)
      return res;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération des interventions du contrat'
      notificationStore.error('Erreur', error.value);
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => (error.value = null)
  const clearCurrent = () => (currentIntervention.value = null)

  return {
    // state
    interventions,
    currentIntervention,
    loading,
    error,
    pagination,
    
    // getters
    getInterventions,
    getCurrentIntervention,
    isLoading,
    getError,
    getPagination,
    
    // actions
    listInterventions,
    createIntervention,
    finishIntervention,
    getInterventionById,
    updateInterventionStatus,
    cancelIntervention,
    getInterventionsByContract,
    clearError,
    clearCurrent
  }
})
