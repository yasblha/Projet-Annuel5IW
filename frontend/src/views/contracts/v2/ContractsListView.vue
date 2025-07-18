<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
    <div class="max-w-7xl mx-auto">
      <!-- En-tête avec titre et bouton de création -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Contrats (V2)</h1>
        <router-link 
          to="/contracts/v2/create" 
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="fas fa-plus mr-2"></i> Créer un contrat
        </router-link>
      </div>

      <!-- Filtres de recherche -->
      <div class="bg-white shadow rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700">Recherche</label>
            <input
              type="text"
              id="search"
              v-model="filters.search"
              placeholder="Rechercher un contrat..."
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">Statut</label>
            <select
              id="status"
              v-model="filters.status"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @change="loadContracts"
            >
              <option value="">Tous les statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="VALIDATED">Validé</option>
              <option value="SIGNED">Signé</option>
              <option value="TERMINATED">Résilié</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="loadContracts"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i class="fas fa-search mr-2"></i>
              Filtrer
            </button>
          </div>
        </div>
      </div>

      <!-- Indicateur de chargement -->
      <div v-if="loading" class="flex justify-center my-12">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
        <span class="ml-3 text-xl text-gray-600">Chargement des contrats...</span>
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

      <!-- Liste des contrats -->
      <div v-else-if="contracts.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <!-- Débogage temporaire (à supprimer en production) -->
        <div class="p-4 bg-gray-100">
          <button @click="showDebug = !showDebug" class="text-xs text-blue-600 hover:underline">
            {{ showDebug ? 'Masquer' : 'Afficher' }} les données brutes
          </button>
          <pre v-if="showDebug" class="mt-2 text-xs overflow-auto max-h-40">{{ JSON.stringify(contracts[0], null, 2) }}</pre>
        </div>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Périodicité</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date début</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="contract in contracts" :key="contract.id">
              <!-- Débogage -->
              <template v-if="contract === contracts[0]">
                {{ console.log('Premier contrat affiché:', contract) }}
              </template>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ contract.reference || contract.id.substring(0, 8) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ contract.clientName || contract.clientId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ contract.templateName || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatPeriodicity(contract.periodicity) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(contract.startDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClasses(contract.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusText(contract.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatPrice(contract.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex space-x-2 justify-end">
                  <!-- Bouton Valider - uniquement pour les contrats en brouillon -->
                  <button 
                    v-if="contract.status === 'DRAFT'"
                    @click="validateContract(contract.id)"
                    class="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    title="Valider le contrat"
                  >
                    <i class="fas fa-check mr-1"></i> Valider
                  </button>
                  
                  <!-- Bouton Signer - uniquement pour les contrats validés -->
                  <button 
                    v-if="contract.status === 'VALIDATED'"
                    @click="signContract(contract.id)"
                    class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    title="Signer le contrat"
                  >
                    <i class="fas fa-signature mr-1"></i> Signer
                  </button>
                  
                  <!-- Bouton Résilier - uniquement pour les contrats validés ou signés -->
                  <button 
                    v-if="['VALIDATED', 'SIGNED'].includes(contract.status)"
                    @click="openTerminateModal(contract.id)"
                    class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    title="Résilier le contrat"
                  >
                    <i class="fas fa-times-circle mr-1"></i> Résilier
                  </button>
                  
                  <!-- Bouton de détails (pour tous les contrats) -->
                  <button 
                    @click="viewContractDetails(contract.id)" 
                    class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    title="Voir les détails"
                  >
                    <i class="fas fa-eye mr-1"></i> Voir détails
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Message si pas de contrats -->
      <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
        <i class="fas fa-file-contract text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-700">Aucun contrat trouvé</h3>
        <p class="mt-2 text-gray-500">Créez votre premier contrat en cliquant sur "Nouveau contrat".</p>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex justify-center mt-6">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span class="sr-only">Précédent</span>
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            v-for="page in paginationRange"
            :key="page"
            @click="changePage(page)"
            :class="[
              pagination.page === page
                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
              'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span class="sr-only">Suivant</span>
            <i class="fas fa-chevron-right"></i>
          </button>
        </nav>
      </div>
    </div>

    <!-- Modal de résiliation -->
    <div v-if="terminateModalVisible" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
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
            @click="terminateModalVisible = false"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContractV2Store } from '@/stores/contract-v2.store';
import type { ContractV2 } from '@/services/api/contract-v2.service';
import { debounce } from 'lodash';

const router = useRouter();
const contractStore = useContractV2Store();

// État local
const loading = ref(false);
const error = ref<string | null>(null);
const filters = ref({
  search: '',
  status: '',
});
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

// État pour la modal de résiliation
const terminateModalVisible = ref(false);
const terminateReason = ref('');
const contractToTerminate = ref<string | null>(null);

// État pour le débogage
const showDebug = ref(false);

// Computed properties
const contracts = computed(() => {
  console.log('Contrats dans le composant:', contractStore.getContracts);
  return contractStore.getContracts;
});
const paginationRange = computed(() => {
  const range = [];
  const start = Math.max(1, pagination.value.page - 2);
  const end = Math.min(pagination.value.totalPages, pagination.value.page + 2);
  
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  
  return range;
});

// Méthodes
const loadContracts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const result = await contractStore.listContracts({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: filters.value.search,
      status: filters.value.status,
    });
    
    console.log('Contrats récupérés:', contractStore.getContracts);
    
    pagination.value = contractStore.getPagination;
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des contrats';
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = debounce(() => {
  pagination.value.page = 1; // Réinitialiser la page lors d'une recherche
  loadContracts();
}, 300);

const changePage = (page: number) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  pagination.value.page = page;
  loadContracts();
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

const formatPrice = (price?: number): string => {
  if (price === undefined || price === null) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const formatPeriodicity = (periodicity: string | null | undefined): string => {
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

const getStatusText = (status: string | null | undefined): string => {
  if (!status) return 'N/A';
  const statusMap: Record<string, string> = {
    'DRAFT': 'Brouillon',
    'VALIDATED': 'Validé',
    'SIGNED': 'Signé',
    'TERMINATED': 'Résilié'
  };
  return statusMap[status] || status;
};

const getStatusClasses = (status: string | null | undefined): string => {
  if (!status) return 'bg-gray-100 text-gray-800';
  const classMap: Record<string, string> = {
    'DRAFT': 'bg-gray-100 text-gray-800',
    'VALIDATED': 'bg-yellow-100 text-yellow-800',
    'SIGNED': 'bg-green-100 text-green-800',
    'TERMINATED': 'bg-red-100 text-red-800'
  };
  return classMap[status] || 'bg-gray-100 text-gray-800';
};

const validateContract = async (id: string) => {
  try {
    loading.value = true;
    await contractStore.validateContract(id);
    await loadContracts(); // Recharger la liste après validation
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la validation du contrat';
  } finally {
    loading.value = false;
  }
};

const signContract = async (id: string) => {
  try {
    loading.value = true;
    await contractStore.signContract(id);
    await loadContracts(); // Recharger la liste après signature
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la signature du contrat';
  } finally {
    loading.value = false;
  }
};

const openTerminateModal = (id: string) => {
  contractToTerminate.value = id;
  terminateReason.value = '';
  terminateModalVisible.value = true;
};

const terminateContract = async () => {
  if (!contractToTerminate.value) return;
  
  try {
    loading.value = true;
    await contractStore.terminateContract(contractToTerminate.value, terminateReason.value);
    terminateModalVisible.value = false;
    await loadContracts(); // Recharger la liste après résiliation
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la résiliation du contrat';
  } finally {
    loading.value = false;
  }
};

const viewContractDetails = (id: string) => {
  console.log('Redirection vers les détails du contrat:', id);
  router.push(`/dashboard/contrats/v2/${id}`);
};

// Charger les contrats au montage du composant
onMounted(() => {
  loadContracts();
});
</script>
