import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { meterApi } from '@/services/api/meter.service'
import { useNotificationStore } from './notification.store'

export interface Meter {
  id: string
  serial: string
  type: string
  dateInstallation: string
  valeurDernierReleve: number
  dateDernierReleve: string
  statut: string
}

export interface MeterReading {
  date: string
  value: number
}

export const useMeterStore = defineStore('meter', () => {
  // État
  const meters = ref<Meter[]>([])
  const currentMeter = ref<Meter | null>(null)
  const meterReadings = ref<MeterReading[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0
  })

  // Getters
  const meterCount = computed(() => meters.value.length)

  // Actions
  /**
   * Liste tous les compteurs disponibles
   * @param page Page à récupérer
   * @param limit Nombre d'éléments par page
   */
  const listMeters = async (page = 1, limit = 10) => {
    isLoading.value = true
    error.value = null
    pagination.value.page = page
    pagination.value.limit = limit

    try {
      const filters = `page=${page}&limit=${limit}`
      const response = await meterApi.getAll(filters)
      
      if (response && response.success) {
        meters.value = response.items || response.data || []
        pagination.value.total = response.total || meters.value.length
        return meters.value
      } else {
        throw new Error('Échec de récupération des compteurs')
      }
    } catch (err) {
      console.error('Erreur lors du chargement des compteurs:', err)
      error.value = "Impossible de charger la liste des compteurs"
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère un compteur par son ID
   * @param id ID du compteur à récupérer
   */
  const getMeterById = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await meterApi.getById(id)
      
      if (response && (response.success || response.data)) {
        currentMeter.value = response.data || response
        return currentMeter.value
      } else {
        throw new Error(`Compteur ${id} non trouvé`)
      }
    } catch (err) {
      console.error(`Erreur lors de la récupération du compteur ${id}:`, err)
      error.value = `Impossible de récupérer le compteur ${id}`
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère l'historique des relevés d'un compteur
   * @param id ID du compteur
   */
  const getMeterReadings = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await meterApi.getReadings(id)
      
      if (response && (response.success || response.data)) {
        meterReadings.value = response.data || response
        return meterReadings.value
      } else {
        throw new Error(`Relevés du compteur ${id} non trouvés`)
      }
    } catch (err) {
      console.error(`Erreur lors de la récupération des relevés du compteur ${id}:`, err)
      error.value = `Impossible de récupérer les relevés du compteur ${id}`
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère les compteurs associés à un contrat spécifique
   * @param contractId ID du contrat
   */
  const getMetersByContractId = async (contractId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const filters = `contractId=${contractId}`
      const response = await meterApi.getAll(filters)

      if (response && response.items) {
        return response
      }

      return []
    } catch (err) {
      console.error('Erreur lors de la récupération des compteurs par contrat:', err)
      error.value = "Impossible de récupérer les compteurs pour ce contrat"
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Génère des compteurs de test et les associe aux contrats
   * @returns Résultat de l'opération
   */
  const generateTestMeters = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await meterApi.generateTestMeters()
      
      if (response.success) {
        // Recharger la liste des compteurs
        await listMeters()
        return {
          success: true,
          message: response.message || 'Compteurs générés avec succès'
        }
      } else {
        error.value = response.message || 'Erreur lors de la génération des compteurs'
        return {
          success: false,
          message: error.value
        }
      }
    } catch (err) {
      const errorMsg = 'Erreur lors de la génération des compteurs'
      error.value = errorMsg
      console.error('Erreur generateTestMeters:', err)
      return {
        success: false,
        message: errorMsg
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Génère un compteur virtuel pour un contrat
   * @param data Données nécessaires (adresse, zone)
   * @returns Le compteur virtuel généré
   */
  const generateVirtualMeter = async (data: { adresse: any; zone: string }) => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('Store: Génération d\'un compteur virtuel avec données:', data)
      const response = await meterApi.generateVirtualMeter(data)
      
      console.log('Store: Réponse de l\'API generateVirtualMeter:', response)
      if (response && response.id) {
        // Si le compteur a été créé avec succès, l'ajouter à la liste des compteurs
        if (!meters.value.find(m => m.id === response.id)) {
          meters.value.push(response)
        }
        return {
          success: true,
          data: response
        }
      } else {
        throw new Error('La réponse de l\'API ne contient pas d\'ID de compteur')
      }
    } catch (err) {
      console.error('Erreur lors de la génération du compteur virtuel:', err)
      error.value = err.message || 'Erreur lors de la génération du compteur virtuel'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // État
    meters: readonly(meters),
    currentMeter: readonly(currentMeter),
    meterReadings: readonly(meterReadings),
    isLoading: readonly(isLoading),
    error: readonly(error),
    // Getters
    meterCount,
    // Actions
    listMeters,
    getMeterById,
    getMeterReadings,
    getMetersByContractId,
    generateTestMeters,
    generateVirtualMeter
  }
})