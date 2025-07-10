<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Suivi des signatures</h2>
      <p class="text-gray-600">Suivez en temps réel l'avancement des signatures</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Progression générale -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Progression globale</h3>
          
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-700">Signatures complètes</span>
              <span class="text-sm font-medium text-gray-900">{{ signatureProgress }}%</span>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                class="bg-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                :style="{ width: signatureProgress + '%' }"
              ></div>
            </div>
            
            <div class="flex justify-between text-xs text-gray-500">
              <span>{{ signedCount }} signé(s)</span>
              <span>{{ totalSignatures }} total</span>
            </div>
          </div>
        </div>

        <!-- Statut temps-réel -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Statut temps-réel</h3>
          
          <div class="space-y-3">
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <div class="flex-shrink-0">
                <div class="h-2 w-2 rounded-full" :class="wsStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'"></div>
              </div>
              <span class="text-sm text-gray-700">
                {{ wsStatus === 'connected' ? 'Connexion WebSocket active' : 'Connexion WebSocket inactive' }}
              </span>
            </div>
            
            <div v-if="lastUpdate" class="text-xs text-gray-500">
              Dernière mise à jour: {{ formatTime(lastUpdate) }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <button
            type="button"
            @click="refreshSignatures"
            :disabled="isRefreshing"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isRefreshing" class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isRefreshing ? 'Actualisation...' : 'Actualiser' }}
          </button>
          
          <button
            type="button"
            @click="resendInvitations"
            :disabled="isResending"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isResending" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            {{ isResending ? 'Envoi...' : 'Renvoyer les invitations' }}
          </button>
        </div>
      </div>

      <!-- Liste des signatures -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Détail des signatures</h3>
          
          <div class="space-y-3">
            <div
              v-for="(signature, index) in signatures"
              :key="index"
              class="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full flex items-center justify-center" :class="getStatusColor(signature.statutSignature)">
                      <svg v-if="signature.statutSignature === 'SIGNE'" class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <svg v-else-if="signature.statutSignature === 'REFUSE'" class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <svg v-else class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ signature.nom }} {{ signature.prenom }}
                    </p>
                    <p class="text-sm text-gray-500">{{ signature.email }}</p>
                    <p class="text-xs text-gray-400">{{ signature.part }}%</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-sm font-medium" :class="getStatusTextColor(signature.statutSignature)">
                    {{ getStatusText(signature.statutSignature) }}
                  </span>
                  <p v-if="signature.dateSignature" class="text-xs text-gray-500">
                    {{ formatDate(signature.dateSignature) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div v-if="notifications.length > 0" class="space-y-2">
          <h4 class="text-sm font-medium text-gray-900">Notifications récentes</h4>
          <div class="space-y-2">
            <div
              v-for="(notification, index) in notifications"
              :key="index"
              class="p-3 rounded-md text-sm"
              :class="getNotificationClass(notification.type)"
            >
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg v-if="notification.type === 'success'" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm" :class="getNotificationTextClass(notification.type)">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-gray-500">{{ formatTime(notification.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        v-if="signatureProgress === 100"
        type="submit"
        @click="handleSubmit"
        :disabled="!isValid || isLoading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {{ isLoading ? 'Finalisation...' : 'Finaliser le contrat' }}
      </button>
      
      <div v-else class="text-sm text-gray-500 flex items-center">
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        En attente des signatures ({{ signatureProgress }}%)
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/use-websocket'

// Props & Emits
const props = defineProps<{
  formData: any
}>()

const emit = defineEmits<{
  'update:formData': [data: any]
  'next': []
  'previous': []
}>()

// Reactive state
const signatures = ref<any[]>([])
const notifications = ref<any[]>([])
const wsStatus = ref<'connected' | 'disconnected'>('disconnected')
const lastUpdate = ref<Date | null>(null)
const isRefreshing = ref(false)
const isResending = ref(false)
const isLoading = ref(false)

// WebSocket
const { connect, disconnect, onMessage, isConnected } = useWebSocket()

// Computed
const isValid = computed(() => {
  return signatureProgress.value === 100
})

const signatureProgress = computed(() => {
  if (signatures.value.length === 0) return 0
  const signed = signatures.value.filter(s => s.statutSignature === 'SIGNE').length
  return Math.round((signed / signatures.value.length) * 100)
})

const signedCount = computed(() => {
  return signatures.value.filter(s => s.statutSignature === 'SIGNE').length
})

const totalSignatures = computed(() => {
  return signatures.value.length
})

// Methods
const getStatusColor = (status: string) => {
  switch (status) {
    case 'SIGNE':
      return 'bg-green-500'
    case 'REFUSE':
      return 'bg-red-500'
    default:
      return 'bg-yellow-500'
  }
}

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'SIGNE':
      return 'text-green-600'
    case 'REFUSE':
      return 'text-red-600'
    default:
      return 'text-yellow-600'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'SIGNE':
      return 'Signé'
    case 'REFUSE':
      return 'Refusé'
    default:
      return 'En attente'
  }
}

const getNotificationClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border border-green-200'
    case 'error':
      return 'bg-red-50 border border-red-200'
    default:
      return 'bg-blue-50 border border-blue-200'
  }
}

const getNotificationTextClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-800'
    case 'error':
      return 'text-red-800'
    default:
      return 'text-blue-800'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const refreshSignatures = async () => {
  isRefreshing.value = true
  try {
    // Simuler appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    lastUpdate.value = new Date()
    
    // Simuler mise à jour des signatures
    signatures.value.forEach(sig => {
      if (sig.statutSignature === 'EN_ATTENTE' && Math.random() > 0.7) {
        sig.statutSignature = 'SIGNE'
        sig.dateSignature = new Date().toISOString()
        
        notifications.value.unshift({
          type: 'success',
          message: `${sig.prenom} ${sig.nom} a signé le contrat`,
          timestamp: new Date()
        })
      }
    })
  } catch (error) {
    console.error('Erreur actualisation:', error)
  } finally {
    isRefreshing.value = false
  }
}

const resendInvitations = async () => {
  isResending.value = true
  try {
    // Simuler renvoi invitations
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    notifications.value.unshift({
      type: 'info',
      message: 'Invitations renvoyées avec succès',
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Erreur renvoi invitations:', error)
  } finally {
    isResending.value = false
  }
}

const handleSignatureUpdate = (data: any) => {
  const signatureIndex = signatures.value.findIndex(s => s.cosignataireId === data.cosignataireId)
  
  if (signatureIndex !== -1) {
    signatures.value[signatureIndex] = { ...signatures.value[signatureIndex], ...data }
    lastUpdate.value = new Date()
    
    notifications.value.unshift({
      type: data.statutSignature === 'SIGNE' ? 'success' : 'error',
      message: `${signatures.value[signatureIndex].prenom} ${signatures.value[signatureIndex].nom} a ${data.statutSignature === 'SIGNE' ? 'signé' : 'refusé'} le contrat`,
      timestamp: new Date()
    })
  }
}

const handleSubmit = async () => {
  if (!isValid.value) {
    return
  }
  
  isLoading.value = true
  try {
    emit('update:formData', { signatures: signatures.value })
    emit('next')
  } catch (error) {
    console.error('Erreur finalisation:', error)
  } finally {
    isLoading.value = false
  }
}

// WebSocket handlers
const handleWebSocketMessage = (data: any) => {
  if (data.type === 'contract.cosigner_signed') {
    handleSignatureUpdate(data.data)
  }
}

// Lifecycle
onMounted(() => {
  // Connect WebSocket
  connect()
  onMessage('contract.cosigner_signed', handleWebSocketMessage)
  
  // Simuler données initiales
  if (props.formData?.cosigners) {
    signatures.value = props.formData.cosigners.map((cosigner: any, index: number) => ({
      cosignataireId: `cosigner-${index}`,
      nom: cosigner.nom,
      prenom: cosigner.prenom,
      email: cosigner.email,
      part: cosigner.part,
      statutSignature: 'EN_ATTENTE',
      dateSignature: null
    }))
  }
  
  // Auto-refresh toutes les 30 secondes
  const refreshInterval = setInterval(refreshSignatures, 30000)
  
  onUnmounted(() => {
    clearInterval(refreshInterval)
    disconnect()
  })
})

// Watch WebSocket status
watch(isConnected, (connected) => {
  wsStatus.value = connected ? 'connected' : 'disconnected'
})
</script> 