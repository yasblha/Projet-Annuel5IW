<template>
  <div class="analytics-dashboard">
    <div class="page-header mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Tableau de bord analytique</h1>
      <p class="text-gray-500">Vue d'ensemble des contrats et clients</p>
    </div>

    <div v-if="loading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>

    <div v-else>
      <!-- Statistiques des contrats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Total contrats</h3>
            <span class="text-blue-500"><i class="fas fa-file-contract text-xl"></i></span>
          </div>
          <p class="text-3xl font-bold mt-2">{{ contractStats.total || 0 }}</p>
          <div class="mt-2 text-sm text-gray-500">contrats enregistrés</div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Contrats actifs</h3>
            <span class="text-green-500"><i class="fas fa-check-circle text-xl"></i></span>
          </div>
          <p class="text-3xl font-bold mt-2">{{ contractStats.actifs || 0 }}</p>
          <div class="mt-2 text-sm text-gray-500">
            {{ ((contractStats.actifs / contractStats.total) * 100 || 0).toFixed(1) }}% du total
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">En attente</h3>
            <span class="text-yellow-500"><i class="fas fa-clock text-xl"></i></span>
          </div>
          <p class="text-3xl font-bold mt-2">{{ contractStats.enAttente || 0 }}</p>
          <div class="mt-2 text-sm text-gray-500">contrats non finalisés</div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Résiliés</h3>
            <span class="text-red-500"><i class="fas fa-times-circle text-xl"></i></span>
          </div>
          <p class="text-3xl font-bold mt-2">{{ contractStats.resilies || 0 }}</p>
          <div class="mt-2 text-sm text-gray-500">contrats terminés</div>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Répartition par type de contrat</h3>
          <div class="h-64">
            <BarChart 
              v-if="hasContractTypeData" 
              :data="contractTypeChartData"
              :options="contractTypeChartOptions"
            />
            <div v-else class="flex h-full items-center justify-center text-gray-400">
              <p>Aucune donnée disponible</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Évolution des contrats</h3>
          <div class="h-64">
            <LineChart 
              v-if="hasContractMonthData" 
              :data="contractMonthChartData"
              :options="contractMonthChartOptions"
            />
            <div v-else class="flex h-full items-center justify-center text-gray-400">
              <p>Aucune donnée disponible</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des derniers contrats -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Derniers contrats</h3>
          <RouterLink to="/contracts" class="text-sm text-blue-500 hover:text-blue-700">
            Voir tous les contrats
          </RouterLink>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date début</th>
                <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="contract in recentContracts" :key="contract.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ contract.numero }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ contract.proprietaireNom || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatContractType(contract.typeContrat) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusClass(contract.statut)"
                  >
                    {{ formatStatus(contract.statut) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(contract.dateDebut) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <RouterLink :to="`/contracts/${contract.id}`" class="text-blue-600 hover:text-blue-900">
                    Détails
                  </RouterLink>
                </td>
              </tr>
              <tr v-if="recentContracts.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">Aucun contrat trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAnalyticsStore } from '@/stores/analytics.store';
import { useContractStore } from '@/stores/contract.store';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar as BarChart, Line as LineChart } from 'vue-chartjs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// Stores
const analyticsStore = useAnalyticsStore();
const contractStore = useContractStore();

// État
const loading = ref(true);
const recentContracts = ref([]);
const contractStats = ref({
  total: 0,
  actifs: 0,
  enAttente: 0,
  resilies: 0,
  parType: {},
  parZone: {},
  parMois: {}
});

// Charger les données
const loadData = async () => {
  try {
    loading.value = true;
    
    // Charger les statistiques des contrats
    const stats = await analyticsStore.fetchContractStats();
    contractStats.value = stats;
    
    // Charger les contrats récents
    const response = await contractStore.list({ limit: 5, sort: 'dateCreation:desc' });
    recentContracts.value = response.items || [];
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  } finally {
    loading.value = false;
  }
};

// Formatage des données pour les graphiques
const hasContractTypeData = computed(() => 
  contractStats.value.parType && Object.keys(contractStats.value.parType).length > 0
);

const contractTypeChartData = computed(() => {
  if (!hasContractTypeData.value) return null;
  
  const types = Object.keys(contractStats.value.parType);
  return {
    labels: types.map(type => formatContractType(type)),
    datasets: [{
      label: 'Nombre de contrats',
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      data: types.map(type => contractStats.value.parType[type])
    }]
  };
});

const contractTypeChartOptions = {
  responsive: true,
  maintainAspectRatio: false
};

// Graphique évolution par mois
const hasContractMonthData = computed(() => 
  contractStats.value.parMois && Object.keys(contractStats.value.parMois).length > 0
);

const contractMonthChartData = computed(() => {
  if (!hasContractMonthData.value) return null;
  
  const months = Object.keys(contractStats.value.parMois).sort();
  return {
    labels: months.map(month => {
      const [year, monthNum] = month.split('-');
      return format(new Date(parseInt(year), parseInt(monthNum) - 1, 1), 'MMM yyyy', { locale: fr });
    }),
    datasets: [{
      label: 'Nouveaux contrats',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3B82F6',
      data: months.map(month => contractStats.value.parMois[month])
    }]
  };
});

const contractMonthChartOptions = {
  responsive: true,
  maintainAspectRatio: false
};

// Fonctions utilitaires
const formatContractType = (type) => {
  const typeMap = {
    'I': 'Individuel',
    'P': 'Professionnel',
    'C': 'Collectivité',
    'A': 'Association'
  };
  return typeMap[type] || type;
};

const formatStatus = (status) => {
  const statusMap = {
    'DRAFT': 'Brouillon',
    'WAITING_SIGNATURE': 'En attente de signature',
    'ACTIF': 'Actif',
    'TERMINE': 'Terminé',
    'RESILIE': 'Résilié',
    'SUSPENDU': 'Suspendu'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const statusClassMap = {
    'DRAFT': 'bg-gray-100 text-gray-800',
    'WAITING_SIGNATURE': 'bg-yellow-100 text-yellow-800',
    'ACTIF': 'bg-green-100 text-green-800',
    'TERMINE': 'bg-blue-100 text-blue-800',
    'RESILIE': 'bg-red-100 text-red-800',
    'SUSPENDU': 'bg-orange-100 text-orange-800'
  };
  return statusClassMap[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    return dateString;
  }
};

// Initialisation
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.analytics-dashboard {
  padding: 1.5rem;
}

.page-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}
</style>
