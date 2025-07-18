<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Indicateur de chargement -->
      <div v-if="loading" class="flex justify-center my-12">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
        <span class="ml-3 text-xl text-gray-600">Chargement du contrat...</span>
      </div>
      
      <!-- Message d'erreur -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 my-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-circle text-red-400"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Détails du contrat -->
      <div v-else-if="contract" class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- En-tête avec ID et statut -->
        <div class="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between border-b border-gray-200">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Contrat #{{ contract.id.substring(0, 8) }}</h1>
            <p class="mt-1 text-sm text-gray-600">
              Créé le {{ formatDate(contract.createdAt) }}
            </p>
          </div>
          <div class="flex items-center gap-3 mt-2 sm:mt-0">
            <span :class="statusClasses" class="px-3 py-1 rounded-full text-xs font-medium">
              {{ statusText }}
            </span>
            <button 
              @click="goBack"
              class="text-gray-600 hover:text-gray-900"
              title="Retour"
            >
              <i class="fas fa-chevron-left"></i> Retour
            </button>
          </div>
        </div>
        
        <!-- Boutons d'action -->
        <div class="bg-blue-50 px-6 py-3">
          <div class="flex flex-wrap gap-2 justify-end">
            <!-- Bouton Résilier - disponible pour les contrats validés et signés -->
            <button 
              v-if="['VALIDATED', 'SIGNED'].includes(contract.status)"
              @click="showTerminateModal = true"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <i class="fas fa-times-circle mr-2"></i> Résilier
            </button>

            <!-- Bouton pour les contrats en attente de validation -->
            <button 
              v-if="contract.status === 'DRAFT'"
              @click="validateContract"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <i class="fas fa-check mr-2"></i> Valider le contrat
            </button>

            <!-- Bouton pour les contrats validés -->
            <button 
              v-if="contract.status === 'VALIDATED'"
              @click="signContract"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <i class="fas fa-signature mr-2"></i> Signer le contrat
            </button>
          </div>
        </div>
        
        <!-- Onglets de navigation -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="flex -mb-px space-x-8">
            <button
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-4 px-1 border-b-2 font-medium text-sm"
              :class="[
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i :class="tab.icon" class="mr-2"></i>
              {{ tab.name }}
            </button>
          </nav>
        </div>
        
        <!-- Contenu des onglets -->
        <div class="p-6">
          <!-- Onglet Informations -->
          <div v-if="activeTab === 'info'" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Informations générales du contrat -->
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Informations du contrat</h3>
              </div>
              <div class="border-t border-gray-200">
                <dl>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">ID</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ contract.id }}</dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Client ID</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ contract.clientId }}</dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Template ID</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ contract.templateId }}</dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Date de début</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatDate(contract.startDate) }}</dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Date de fin</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ contract.endDate ? formatDate(contract.endDate) : 'Non définie' }}</dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Prix</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatPrice(contract.price) }}</dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Périodicité</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatPeriodicity(contract.periodicity) }}</dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Compteur ID</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ contract.meterId || 'Non associé' }}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Informations sur le template -->
            <div v-if="template" class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Détails du template</h3>
              </div>
              <div class="border-t border-gray-200">
                <dl>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Nom</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ template.name }}</dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Prix</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatPrice(template.price) }}</dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Périodicité</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatPeriodicity(template.periodicity) }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <!-- Onglet Contenu du contrat -->
          <div v-else-if="activeTab === 'content'" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Contenu du contrat</h3>
            </div>
            <div class="border-t border-gray-200 p-6">
              <div v-if="template" class="prose max-w-none" v-html="renderedContent"></div>
              <div v-else class="text-center py-8">
                <i class="fas fa-file-alt text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">Contenu du template non disponible</p>
              </div>
            </div>
          </div>

          <!-- Onglet Historique -->
          <div v-else-if="activeTab === 'history'" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Historique du contrat</h3>
            </div>
            <div class="border-t border-gray-200">
              <div v-if="contractHistory.length > 0" class="flow-root">
                <ul role="list" class="-mb-8">
                  <li v-for="(item, index) in contractHistory" :key="item.id">
                    <div class="relative pb-8">
                      <span v-if="index !== contractHistory.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div class="relative flex space-x-3">
                        <div>
                          <span :class="getHistoryIconClass(item.action)" class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                            <i :class="getHistoryIcon(item.action)" class="text-white"></i>
                          </span>
                        </div>
                        <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p class="text-sm text-gray-500">
                              {{ getHistoryActionText(item) }}
                            </p>
                          </div>
                          <div class="text-right text-sm whitespace-nowrap text-gray-500">
                            {{ formatDateTime(item.timestamp) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div v-else class="text-center py-8">
                <i class="fas fa-history text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">Aucun historique disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si pas de contrat -->
      <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
        <i class="fas fa-exclamation-triangle text-4xl text-amber-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-700">Contrat non trouvé</h3>
        <p class="mt-2 text-gray-500">Le contrat demandé n'existe pas ou vous n'avez pas les droits pour y accéder.</p>
        <button @click="goBack" class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          Retour à la liste
        </button>
      </div>
    </div>
  </div>
  
  <!-- Modal de résiliation -->
  <div v-if="showTerminateModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Résilier le contrat</h3>
      <div class="mb-4">
        <label for="reason" class="block text-sm font-medium text-gray-700">Motif de résiliation</label>
        <textarea
          id="reason"
          v-model="terminateReason"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Veuillez indiquer le motif de résiliation..."
        ></textarea>
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="showTerminateModal = false"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          @click="terminateContract"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Confirmer la résiliation
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useContractV2Store } from '@/stores/contract-v2.store';
import type { ContractV2, TemplateV2, ContractHistoryEntry as ContractHistoryItem } from '@/services/api/contract-v2.service';
import { marked } from 'marked';

const route = useRoute();
const router = useRouter();
const contractStore = useContractV2Store();

// État local
const contract = ref<ContractV2 | null>(null);
const template = ref<TemplateV2 | null>(null);
const contractHistory = ref<ContractHistoryItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref('info');
const showTerminateModal = ref(false);
const terminateReason = ref('');

// Computed properties
const statusText = computed(() => {
  if (!contract.value) return '';
  
  const statusMap: Record<string, string> = {
    'DRAFT': 'Brouillon',
    'VALIDATED': 'Validé',
    'SIGNED': 'Signé',
    'TERMINATED': 'Résilié'
  };
  
  return statusMap[contract.value.status] || contract.value.status;
});

const statusClasses = computed(() => {
  if (!contract.value) return '';
  
  const classMap: Record<string, string> = {
    'DRAFT': 'bg-gray-100 text-gray-800',
    'VALIDATED': 'bg-yellow-100 text-yellow-800',
    'SIGNED': 'bg-green-100 text-green-800',
    'TERMINATED': 'bg-red-100 text-red-800'
  };
  
  return classMap[contract.value.status] || 'bg-gray-100 text-gray-800';
});

const renderedContent = computed(() => {
  // Utiliser templateContent du contrat s'il existe, sinon utiliser bodyMd du template
  if (contract.value && contract.value.templateContent) {
    return marked(contract.value.templateContent);
  } else if (template.value && template.value.bodyMd) {
    return marked(template.value.bodyMd);
  }
  return '';
});

const tabs = [
  { id: 'info', name: 'Informations', icon: 'fas fa-info-circle' },
  { id: 'content', name: 'Contenu', icon: 'fas fa-file-alt' },
  { id: 'history', name: 'Historique', icon: 'fas fa-history' }
];

// Méthodes
const loadContractData = async () => {
  const contractId = route.params.id as string;
  if (!contractId) {
    error.value = 'ID de contrat non spécifié';
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    // Charger les données du contrat
    contract.value = await contractStore.getContractById(contractId);
    
    // Charger le template associé
    if (contract.value && contract.value.templateId) {
      template.value = await contractStore.getTemplateById(contract.value.templateId);
    }
    
    // Charger l'historique du contrat
    try {
      contractHistory.value = await contractStore.getContractHistory(contractId);
    } catch (historyErr: any) {
      console.warn("Impossible de charger l'historique du contrat:", historyErr);
      // Ne pas bloquer l'affichage du contrat si l'historique n'est pas disponible
      contractHistory.value = [];
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des données du contrat';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatPrice = (price?: number): string => {
  if (price === undefined || price === null) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const formatPeriodicity = (periodicity?: string): string => {
  if (!periodicity) return 'N/A';
  const periodicityMap: Record<string, string> = {
    'MONTHLY': 'Mensuel',
    'QUARTERLY': 'Trimestriel',
    'YEARLY': 'Annuel',
    'MENSUEL': 'Mensuel',
    'TRIMESTRIEL': 'Trimestriel',
    'ANNUEL': 'Annuel'
  };
  
  return periodicityMap[periodicity] || periodicity;
};

const goBack = () => {
  router.push('/dashboard/contrats/v2');
};

const validateContract = async () => {
  if (!contract.value) return;
  
  try {
    loading.value = true;
    await contractStore.validateContract(contract.value.id);
    await loadContractData(); // Recharger les données après validation
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la validation du contrat';
  } finally {
    loading.value = false;
  }
};

const signContract = async () => {
  if (!contract.value) return;
  
  try {
    loading.value = true;
    await contractStore.signContract(contract.value.id);
    await loadContractData(); // Recharger les données après signature
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la signature du contrat';
  } finally {
    loading.value = false;
  }
};

const terminateContract = async () => {
  if (!contract.value) return;
  
  try {
    loading.value = true;
    await contractStore.terminateContract(contract.value.id, terminateReason.value);
    showTerminateModal.value = false;
    await loadContractData(); // Recharger les données après résiliation
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la résiliation du contrat';
  } finally {
    loading.value = false;
  }
};

const getHistoryIconClass = (action: string): string => {
  const classMap: Record<string, string> = {
    'CREATE': 'bg-green-500',
    'UPDATE': 'bg-blue-500',
    'STATUS_CHANGE': 'bg-yellow-500',
    'METER_UPDATE': 'bg-purple-500',
    'PRICE_CHANGE': 'bg-indigo-500'
  };
  
  return classMap[action] || 'bg-gray-500';
};

const getHistoryIcon = (action: string): string => {
  const iconMap: Record<string, string> = {
    'CREATE': 'fas fa-plus',
    'UPDATE': 'fas fa-edit',
    'STATUS_CHANGE': 'fas fa-exchange-alt',
    'METER_UPDATE': 'fas fa-tachometer-alt',
    'PRICE_CHANGE': 'fas fa-euro-sign'
  };
  
  return iconMap[action] || 'fas fa-history';
};

const getHistoryActionText = (item: ContractHistoryItem): string => {
  const actionMap: Record<string, string> = {
    'CREATE': 'Création du contrat',
    'UPDATE': 'Mise à jour du contrat',
    'STATUS_CHANGE': `Changement de statut: ${item.oldValue || ''} → ${item.newValue || ''}`,
    'METER_UPDATE': `Mise à jour du compteur: ${item.newValue || ''}`,
    'PRICE_CHANGE': `Changement de prix: ${item.oldValue || ''} → ${item.newValue || ''}`
  };
  
  return actionMap[item.action] || `Action: ${item.action}`;
};

// Charger les données au montage du composant
onMounted(() => {
  loadContractData();
});
</script>
