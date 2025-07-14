<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Historique du contrat</h3>
      <button 
        @click="activeTab === 'audit' ? fetchAuditHistory() : fetchMeterHistory()"
        :disabled="activeTab === 'audit' ? isLoadingHistory : isLoadingMeterHistory"
        class="text-blue-600 hover:text-blue-800 disabled:opacity-50"
        title="Actualiser"
      >
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': activeTab === 'audit' ? isLoadingHistory : isLoadingMeterHistory }"></i>
      </button>
    </div>

    <div class="p-6">
      <!-- Onglets -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex -mb-px space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="[
              activeTab === tab.value
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i :class="tab.icon" class="mr-2"></i>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Onglet d'audit des actions -->
      <div v-if="activeTab === 'audit'">
        <!-- Filtres -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type d'action</label>
            <select 
              v-model="filters.action"
              @change="fetchAuditHistory"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option v-for="action in actionTypes" :key="action" :value="action">
                {{ formatAction(action) }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input 
              v-model="filters.dateDebut"
              type="date"
              @change="fetchAuditHistory"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input 
              v-model="filters.dateFin"
              type="date"
              @change="fetchAuditHistory"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Tableau d'audit -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="header in auditHeaders" :key="header.key" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ header.label }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in auditHistory" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(item.dateAction || item.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getActionBadgeClass(item.action)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ formatAction(item.action) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.user?.fullName || 'Non spécifié' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.details || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="showDetails(item)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    <i class="fas fa-eye mr-1"></i> Voir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="auditHistory.length === 0 && !isLoadingHistory" class="text-center py-8">
          <i class="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">Aucun historique d'audit trouvé</p>
        </div>
      </div>

      <!-- Onglet historique des compteurs -->
      <div v-else-if="activeTab === 'meter'">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="header in meterHeaders" :key="header.key" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ header.label }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in meterHistory" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.numeroCompteur || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(item.dateAssociation) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.dateDissociation ? formatDate(item.dateDissociation) : 'En cours' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="viewMeterDetails(item)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    <i class="fas fa-info-circle mr-1"></i> Détails
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="meterHistory.length === 0 && !isLoadingMeterHistory" class="text-center py-8">
          <i class="fas fa-tachometer-alt text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">Aucun historique de compteur trouvé</p>
        </div>
      </div>
    </div>

    <!-- Modal de détails -->
    <div v-if="detailsDialog" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Détails de l'action</h3>
            <button @click="detailsDialog = false" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div v-if="selectedItem" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Action</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatAction(selectedItem.action) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Date</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedItem.date) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Utilisateur</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedItem.user?.fullName || 'Non spécifié' }}</p>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Détails</label>
              <pre class="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">{{ prettyDetails }}</pre>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button 
              @click="detailsDialog = false"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { contractApi } from '@/services/api/contract.service'

// Props
const props = defineProps({
  contractId: {
    type: String,
    required: true
  }
})

// État réactif
const activeTab = ref('audit')
const isLoadingHistory = ref(false)
const isLoadingMeterHistory = ref(false)
const auditHistory = ref([])
const meterHistory = ref([])
const detailsDialog = ref(false)
const selectedItem = ref(null)

const filters = reactive({
  action: '',
  dateDebut: '',
  dateFin: ''
})

// Configuration des onglets
const tabs = [
  { value: 'audit', label: 'Audit des actions', icon: 'fas fa-history' },
  { value: 'meter', label: 'Historique des compteurs', icon: 'fas fa-tachometer-alt' }
]

// Headers des tableaux
const auditHeaders = [
  { key: 'date', label: 'Date' },
  { key: 'action', label: 'Action' },
  { key: 'user', label: 'Utilisateur' },
  { key: 'details', label: 'Détails' },
  { key: 'actions', label: 'Actions' }
]

const meterHeaders = [
  { key: 'numeroCompteur', label: 'Numéro de compteur' },
  { key: 'dateAssociation', label: 'Date d\'association' },
  { key: 'dateDissociation', label: 'Date de dissociation' },
  { key: 'actions', label: 'Actions' }
]

// Types d'actions
const actionTypes = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'SIGN',
  'TERMINATE',
  'ACTIVATE',
  'DEACTIVATE'
]

// Computed
const prettyDetails = computed(() => {
  if (!selectedItem.value?.details) return 'Aucun détail'
  try {
    return JSON.stringify(JSON.parse(selectedItem.value.details), null, 2)
  } catch {
    return selectedItem.value.details
  }
})

// Méthodes
const fetchAuditHistory = async () => {
  isLoadingHistory.value = true
  try {
    const response = await contractApi.getAuditTrail(props.contractId, filters)
    auditHistory.value = response.data || []
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique d\'audit:', error)
    auditHistory.value = []
  } finally {
    isLoadingHistory.value = false
  }
}

const fetchMeterHistory = async () => {
  isLoadingMeterHistory.value = true
  try {
    const response = await contractApi.getMeterHistory(props.contractId)
    meterHistory.value = response.data || []
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des compteurs:', error)
    meterHistory.value = []
  } finally {
    isLoadingMeterHistory.value = false
  }
}

const showDetails = (item) => {
  selectedItem.value = item
  detailsDialog.value = true
}

const viewMeterDetails = (item) => {
  selectedItem.value = item
  detailsDialog.value = true
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAction = (action) => {
  const actionMap = {
    'CREATE': 'Création',
    'UPDATE': 'Modification',
    'DELETE': 'Suppression',
    'SIGN': 'Signature',
    'TERMINATE': 'Résiliation',
    'ACTIVATE': 'Activation',
    'DEACTIVATE': 'Désactivation'
  }
  return actionMap[action] || action
}

const getActionBadgeClass = (action) => {
  const classMap = {
    'CREATE': 'bg-green-100 text-green-800',
    'UPDATE': 'bg-blue-100 text-blue-800',
    'DELETE': 'bg-red-100 text-red-800',
    'SIGN': 'bg-purple-100 text-purple-800',
    'TERMINATE': 'bg-orange-100 text-orange-800',
    'ACTIVATE': 'bg-green-100 text-green-800',
    'DEACTIVATE': 'bg-gray-100 text-gray-800'
  }
  return classMap[action] || 'bg-gray-100 text-gray-800'
}

// Initialisation
onMounted(() => {
  fetchAuditHistory()
})
</script>

<style scoped>
.details-json {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  overflow-x: auto;
}
</style>
