import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'

export const useMeterStore = defineStore('meter', () => {
  const meters = ref<any[]>([])
  const currentMeter = ref<any>(null)
  const isLoading = ref(false)

  const scanMeter = async (serialNumber: string) => {
    isLoading.value = true
    try {
      // Simulation scan compteur
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const meter = {
        id: 'meter-' + Date.now(),
        numero: `M-TLS-40-${serialNumber}`,
        serialNumber,
        calibre: '40',
        statut: 'ACTIF'
      }
      
      currentMeter.value = meter
      return meter
    } catch (error) {
      console.error('Erreur scan compteur:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const clearCurrentMeter = () => {
    currentMeter.value = null
  }

  return {
    meters: readonly(meters),
    currentMeter: readonly(currentMeter),
    isLoading: readonly(isLoading),
    scanMeter,
    clearCurrentMeter
  }
}) 