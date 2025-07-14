<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- En-tête avec statistiques -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 class="text-3xl font-extrabold text-blue-800 flex items-center gap-2">
            <i class="fas fa-tools"></i> Gestion des interventions
          </h1>
          <p class="mt-1 text-gray-600">
            Planifiez, suivez et gérez les interventions techniques
          </p>
        </div>
        <div class="mt-4 md:mt-0">
          <button 
            @click="openNewInterventionModal" 
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
          >
            <i class="fas fa-plus"></i> Nouvelle intervention
          </button>
        </div>
      </div>

      <!-- Cartes statistiques -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">Total</p>
              <p class="text-2xl font-bold">{{ stats.total }}</p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <i class="fas fa-clipboard-list text-blue-500 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">Planifiées</p>
              <p class="text-2xl font-bold">{{ stats.planifiees }}</p>
            </div>
            <div class="bg-yellow-100 p-3 rounded-full">
              <i class="fas fa-calendar-alt text-yellow-500 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">Terminées</p>
              <p class="text-2xl font-bold">{{ stats.terminees }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <i class="fas fa-check-circle text-green-500 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">Annulées</p>
              <p class="text-2xl font-bold">{{ stats.annulees }}</p>
            </div>
            <div class="bg-red-100 p-3 rounded-full">
              <i class="fas fa-times-circle text-red-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres et contenu principal -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div class="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h2 class="text-xl font-semibold text-blue-800">Filtres</h2>
        </div>
        
        <!-- Filtres -->
        <div class="p-6 border-b">
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <!-- Type d'intervention -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                v-model="filters.type"
                class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="INSTALLATION">Installation</option>
                <option value="REPARATION">Réparation</option>
                <option value="RELEVE">Relevé</option>
              </select>
            </div>
            
            <!-- Statut -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                v-model="filters.statut"
                class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="PLANIFIEE">Planifiée</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINEE">Terminée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
            </div>
            
            <!-- Date de début -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input
                type="date"
                v-model="filters.datePlanifieeFrom"
                class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <!-- Date de fin -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input
                type="date"
                v-model="filters.datePlanifieeTo"
                class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div class="flex justify-end mt-4 gap-2">
            <button
              @click="resetFilters"
              class="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Réinitialiser
            </button>
            <button
              @click="applyFilters"
              class="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
        
        <!-- Liste des interventions -->
        <div class="p-6">
          <!-- Tableau des interventions -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date planifiée</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="loading">
                  <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex justify-center items-center">
                      <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="ml-2">Chargement...</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="interventions.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Aucune intervention trouvée
                  </td>
                </tr>
                <tr v-for="intervention in interventions" :key="intervention.id" class="hover:bg-blue-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ intervention.id.substring(0, 8) }}...
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span :class="typeClass(intervention.type)">
                      {{ typeLabel(intervention.type) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {{ formatDate(intervention.datePlanifiee) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="statusClass(intervention.statut)">
                      {{ statusLabel(intervention.statut) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                    {{ intervention.description || 'Aucune description' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button 
                        @click="viewIntervention(intervention.id)" 
                        class="text-blue-600 hover:text-blue-800"
                        title="Voir les détails"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        @click="editIntervention(intervention.id)" 
                        class="text-yellow-600 hover:text-yellow-800"
                        title="Modifier"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        v-if="intervention.statut === 'PLANIFIEE'"
                        @click="cancelIntervention(intervention)"
                        class="text-red-600 hover:text-red-800"
                        title="Annuler"
                      >
                        <i class="fas fa-times-circle"></i>
                      </button>
                      <button 
                        v-if="intervention.statut === 'PLANIFIEE'"
                        @click="startIntervention(intervention.id)"
                        class="text-green-600 hover:text-green-800"
                        title="Démarrer"
                      >
                        <i class="fas fa-play"></i>
                      </button>
                      <button 
                        v-if="intervention.statut === 'EN_COURS'"
                        @click="finishIntervention(intervention.id)"
                        class="text-green-600 hover:text-green-800"
                        title="Terminer"
                      >
                        <i class="fas fa-check-circle"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="py-3 flex items-center justify-between border-t border-gray-200 mt-4">
            <div class="flex-1 flex justify-between sm:hidden">
              <button @click="prevPage" :disabled="pagination.page <= 1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" :class="{ 'opacity-50 cursor-not-allowed': pagination.page <= 1 }">
                Précédent
              </button>
              <button @click="nextPage" :disabled="pagination.page >= pagination.totalPages" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" :class="{ 'opacity-50 cursor-not-allowed': pagination.page >= pagination.totalPages }">
                Suivant
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Affichage de <span class="font-medium">{{ interventions.length ? (pagination.page - 1) * pagination.limit + 1 : 0 }}</span> à <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> sur <span class="font-medium">{{ pagination.total }}</span> résultats
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button @click="prevPage" :disabled="pagination.page <= 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" :class="{ 'opacity-50 cursor-not-allowed': pagination.page <= 1 }">
                    <span class="sr-only">Précédent</span>
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {{ pagination.page }} sur {{ pagination.totalPages || 1 }}
                  </span>
                  <button @click="nextPage" :disabled="pagination.page >= pagination.totalPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" :class="{ 'opacity-50 cursor-not-allowed': pagination.page >= pagination.totalPages }">
                    <span class="sr-only">Suivant</span>
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Zone pour les vues imbriquées (création/modification/détail) -->
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useInterventionStore } from '@/stores/intervention.store';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Intervention } from '@/types/intervention.types';

// Store et router
const interventionStore = useInterventionStore();
const router = useRouter();

// État réactif
const interventions = computed(() => interventionStore.getInterventions);
const loading = computed(() => interventionStore.isLoading);
const pagination = computed(() => interventionStore.getPagination);

const stats = reactive({
  total: 0,
  planifiees: 0,
  terminees: 0,
  annulees: 0
});

const filters = reactive({
  type: '',
  statut: '',
  datePlanifieeFrom: '',
  datePlanifieeTo: '',
  page: 1,
  limit: 10
});

// Fonctions
const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd MMM yyyy', { locale: fr });
  } catch (e) {
    return date;
  }
};

const typeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'INSTALLATION': 'Installation',
    'REPARATION': 'Réparation',
    'RELEVE': 'Relevé'
  };
  return labels[type] || type;
};

const typeClass = (type: string) => {
  const classes: Record<string, string> = {
    'INSTALLATION': 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800',
    'REPARATION': 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800',
    'RELEVE': 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'
  };
  return classes[type] || 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800';
};

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'PLANIFIEE': 'Planifiée',
    'EN_COURS': 'En cours',
    'TERMINEE': 'Terminée',
    'ANNULEE': 'Annulée'
  };
  return labels[status] || status;
};

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    'PLANIFIEE': 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800',
    'EN_COURS': 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800',
    'TERMINEE': 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800',
    'ANNULEE': 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'
  };
  return classes[status] || 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800';
};

// Actions
const fetchInterventions = async () => {
  try {
    await interventionStore.listInterventions({
      ...filters,
      page: pagination.value.page,
      limit: pagination.value.limit
    });
    // Mettre à jour les stats n'est plus appelé ici pour éviter la boucle infinie
  } catch (error) {
    console.error('Erreur lors du chargement des interventions:', error);
  }
};

const updateStats = async () => {
  try {
    // Récupérer le total des interventions par statut
    const [allInterventions, planifiees, enCours, terminees, annulees] = await Promise.all([
      interventionStore.listInterventions({ limit: 1 }),
      interventionStore.listInterventions({ statut: 'PLANIFIEE', limit: 1 }),
      interventionStore.listInterventions({ statut: 'EN_COURS', limit: 1 }),
      interventionStore.listInterventions({ statut: 'TERMINEE', limit: 1 }),
      interventionStore.listInterventions({ statut: 'ANNULEE', limit: 1 })
    ]);
    
    stats.total = allInterventions.total || 0;
    stats.planifiees = planifiees.total || 0;
    stats.terminees = terminees.total || 0;
    stats.annulees = annulees.total || 0;
    
    // Recharger la liste principale avec les filtres actuels
    fetchInterventions();
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
  }
};

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    if (key !== 'page' && key !== 'limit') {
      // @ts-ignore
      filters[key] = '';
    }
  });
  filters.page = 1;
  fetchInterventions();
};

const applyFilters = () => {
  filters.page = 1;
  fetchInterventions();
};

const prevPage = () => {
  if (pagination.value.page > 1) {
    filters.page = pagination.value.page - 1;
    fetchInterventions();
  }
};

const nextPage = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    filters.page = pagination.value.page + 1;
    fetchInterventions();
  }
};

// Navigation et actions sur les interventions
const viewIntervention = (id: string) => {
  router.push(`/dashboard/interventions/${id}`);
};

const editIntervention = (id: string) => {
  router.push(`/dashboard/interventions/${id}/edit`);
};

const openNewInterventionModal = () => {
  router.push('/dashboard/interventions/new');
};

const startIntervention = async (id: string) => {
  try {
    await interventionStore.updateInterventionStatus(id, 'EN_COURS');
    fetchInterventions();
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'intervention:', error);
  }
};

const finishIntervention = (id: string) => {
  router.push(`/dashboard/interventions/${id}/finish`);
};

const cancelIntervention = async (intervention: Intervention) => {
  if (confirm(`Êtes-vous sûr de vouloir annuler l'intervention ${intervention.id.substring(0, 8)}... ?`)) {
    try {
      await interventionStore.cancelIntervention(intervention.id, 'Annulé par l\'utilisateur');
      fetchInterventions();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'intervention:', error);
    }
  }
};

// Cycle de vie
onMounted(async () => {
  updateStats();
});
</script>
