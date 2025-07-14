<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Suivi des signatures</h2>
      <p class="text-gray-600">
        Gérez les invitations et suivez les signatures des cosignataires
      </p>
    </div>

    <div v-if="noCosignataires" class="my-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">
            Aucun cosignataire
          </h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>Vous n'avez pas ajouté de cosignataires à ce contrat. Vous pouvez continuer sans cosignataires ou revenir à l'étape précédente pour en ajouter.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Intégration du composant CosignatairesInvitationCard -->
      <CosignatairesInvitationCard 
        :contract-id="contractId" 
        :base-url="baseUrl"
        @signatures-updated="handleSignaturesUpdated" 
      />
    </div>

    <!-- Actions -->
    <div class="flex justify-between mt-8">
      <button 
        type="button" 
        @click="$emit('previous')"
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Précédent
      </button>
      
      <button 
        type="button"
        @click="handleSubmit"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Finaliser
        <svg class="-mr-1 ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useContractDraftStore } from '@/stores/contract-draft.store'
import CosignatairesInvitationCard from '@/components/contrats/CosignatairesInvitationCard.vue'

// Props & Emits
const props = defineProps<{
  formData: any
}>()

const emit = defineEmits<{
  'update:formData': [data: any]
  'next': []
  'previous': []
  'save-draft': []
}>()

// Store
const contractDraftStore = useContractDraftStore()

// State
const signatures = ref<any[]>([])
const invitationStatus = ref<Record<string, string>>({})
const isLoading = ref(false)
const submitError = ref('')

// Computed
const contractId = computed(() => contractDraftStore.currentContract?.id || '')

const noCosignataires = computed(() => {
  return !props.formData.cosigners || props.formData.cosigners.length === 0
})

const baseUrl = computed(() => {
  // Obtient l'URL de base pour les liens de signature
  return window.location.origin
})

const allInvited = computed(() => {
  if (noCosignataires.value) return true
  
  // Vérifie si tous les cosignataires ont été invités
  const cosigners = props.formData.cosigners || []
  return cosigners.every(c => invitationStatus.value[c.id] === 'ENVOYE')
})

const canFinalize = computed(() => {
  // On peut finaliser s'il n'y a pas de cosignataires ou si tous sont invités
  return noCosignataires.value || allInvited.value
})

// Methods
const loadSignatureStatus = async () => {
  if (!contractId.value) return
  
  try {
    isLoading.value = true
    
    // Récupérer les statuts des signatures/invitations
    const cosignatairesData = await contractDraftStore.loadCosigners(contractId.value)
    
    if (cosignatairesData) {
      // Mettre à jour le statut des invitations
      cosignatairesData.forEach((cosig: any) => {
        invitationStatus.value[cosig.id] = cosig.statutInvitation || 'NON_ENVOYE'
      })
      
      signatures.value = cosignatairesData
        .filter((cosig: any) => cosig.statutSignature !== 'EN_ATTENTE')
        .map((cosig: any) => ({
          cosignataireId: cosig.id,
          statutSignature: cosig.statutSignature,
          dateSignature: cosig.dateSignature || null
        }))
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statuts de signature:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSignaturesUpdated = (updatedCosignataires: any[]) => {
  // Mettre à jour les statuts après l'envoi des invitations
  updatedCosignataires.forEach(cosig => {
    invitationStatus.value[cosig.id] = cosig.statutInvitation
  })
  
  // Mettre à jour les données du formulaire
  emit('update:formData', { signatures: signatures.value })
}

const handleSubmit = async () => {
  try {
    // Si les cosignataires sont optionnels, on peut toujours finaliser même sans signatures
    emit('update:formData', { signatures: signatures.value })
    emit('next')
  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
    submitError.value = 'Une erreur est survenue. Veuillez réessayer.'
  }
}

// Lifecycle
onMounted(async () => {
  if (contractId.value) {
    await loadSignatureStatus()
  }
})

watch(() => contractId.value, async (newId) => {
  if (newId) {
    await loadSignatureStatus()
  }
})
</script>
