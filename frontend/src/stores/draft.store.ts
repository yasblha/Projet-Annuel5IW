import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDraftStore = defineStore('draft', () => {
  // État pour stocker les données de formulaire en cours d'édition
  const formData = ref<any>({})

  // Sauvegarder un brouillon
  const saveDraft = (data: any) => {
    formData.value = { ...data }
    
    // Optionnellement, sauvegarder dans le localStorage pour persistance
    try {
      localStorage.setItem('contract_draft', JSON.stringify(data))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon dans localStorage:', error)
    }
  }

  // Charger un brouillon
  const loadDraft = () => {
    // Essayer de charger depuis le localStorage
    try {
      const savedDraft = localStorage.getItem('contract_draft')
      if (savedDraft) {
        formData.value = JSON.parse(savedDraft)
        return formData.value
      }
    } catch (error) {
      console.error('Erreur lors du chargement du brouillon depuis localStorage:', error)
    }
    
    return null
  }

  // Effacer un brouillon
  const clearDraft = () => {
    formData.value = {}
    
    // Supprimer du localStorage
    try {
      localStorage.removeItem('contract_draft')
    } catch (error) {
      console.error('Erreur lors de la suppression du brouillon dans localStorage:', error)
    }
  }

  return {
    formData,
    saveDraft,
    loadDraft,
    clearDraft
  }
})
