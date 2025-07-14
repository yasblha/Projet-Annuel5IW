<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-extrabold mb-6 text-blue-800 flex items-center gap-2">
        <i class="fas fa-tachometer-alt"></i> Gestion des compteurs
      </h1>
      
      <!-- Cartes statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">Total compteurs</p>
              <p class="text-2xl font-bold">{{ stats?.total || 0 }}</p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <i class="fas fa-tachometer-alt text-blue-500 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">Compteurs actifs</p>
              <p class="text-2xl font-bold">{{ stats?.actifs || 0 }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <i class="fas fa-check-circle text-green-500 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">En stock</p>
              <p class="text-2xl font-bold">{{ stats?.enStock || 0 }}</p>
            </div>
            <div class="bg-yellow-100 p-3 rounded-full">
              <i class="fas fa-box text-yellow-500 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">Défectueux</p>
              <p class="text-2xl font-bold">{{ stats?.defectueux || 0 }}</p>
            </div>
            <div class="bg-red-100 p-3 rounded-full">
              <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Filtres et recherche -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">Recherche et filtres</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select v-model="filters.statut" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
              <option value="">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="EN_STOCK">En stock</option>
              <option value="INSTALLÉ">Installé</option>
              <option value="DÉFECTUEUX">Défectueux</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Calibre</label>
            <select v-model="filters.calibre" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
              <option value="">Tous les calibres</option>
              <option value="15">15 mm</option>
              <option value="20">20 mm</option>
              <option value="25">25 mm</option>
              <option value="32">32 mm</option>
              <option value="40">40 mm</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Zone</label>
            <select v-model="filters.zone" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
              <option value="">Toutes les zones</option>
              <option value="Paris">Paris</option>
              <option value="Lyon">Lyon</option>
              <option value="Marseille">Marseille</option>
              <option value="Toulouse">Toulouse</option>
              <option value="Autres">Autres</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <div class="relative">
              <input 
                type="text" 
                v-model="filters.search" 
                placeholder="Numéro, série..." 
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 pl-10"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button @click="resetFilters" class="px-4 py-2 mr-2 rounded text-gray-600 hover:bg-gray-100 transition">
            <i class="fas fa-undo mr-2"></i>Réinitialiser
          </button>
          <button @click="applyFilters" class="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
            <i class="fas fa-filter mr-2"></i>Appliquer
          </button>
        </div>
      </div>
      
      <!-- Liste des compteurs -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div class="p-6 bg-blue-50 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-blue-800">Liste des compteurs</h2>
          <button 
            class="px-5 py-2 rounded bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-500 transition flex items-center gap-2" 
            @click="showAddModal = true"
          >
            <i class="fas fa-plus"></i> Ajouter un compteur
          </button>
        </div>
        
        <div v-if="isLoading" class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
          <p class="text-gray-500">Chargement des compteurs...</p>
        </div>
        
        <div v-else>
          <table class="min-w-full divide-y divide-gray-200 text-base">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Numéro</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">N° Série</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Calibre</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Installation</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dernier relevé</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="meter in meters" :key="meter.id" class="hover:bg-blue-50 transition">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-blue-800">{{ meter.numero }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ meter.serialNumber }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ meter.calibre }} mm</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(meter.statut)">
                    {{ getStatusLabel(meter.statut) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <template v-if="meter.dateInstallation">
                    {{ formatDate(meter.dateInstallation) }}
                  </template>
                  <template v-else>
                    <span class="text-gray-400">-</span>
                  </template>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <template v-if="meter.dernierReleve">
                    <div class="flex flex-col">
                      <span>{{ formatDate(meter.dernierReleve.date) }}</span>
                      <span class="text-sm text-gray-500">{{ meter.dernierReleve.valeur }} m³</span>
                    </div>
                  </template>
                  <template v-else>
                    <span class="text-gray-400">-</span>
                  </template>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button class="text-blue-600 hover:text-blue-900 transition mr-2" @click="viewMeter(meter)" title="Voir détails">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="text-green-600 hover:text-green-900 transition mr-2" @click="editMeter(meter)" title="Modifier">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="text-red-600 hover:text-red-900 transition" @click="confirmDeleteMeter(meter)" title="Supprimer">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="meters.length === 0">
                <td colspan="7" class="text-center text-gray-400 py-8">Aucun compteur trouvé.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="flex justify-between items-center mt-6" v-if="pagination && pagination.total > 0">
        <button 
          class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" 
          @click="prevPage" 
          :disabled="pagination.page <= 1"
          :class="pagination.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''"
        >
          Page précédente
        </button>
        <span class="mx-4">Page {{ pagination.page }} sur {{ pagination.totalPages }}</span>
        <button 
          class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" 
          @click="nextPage" 
          :disabled="pagination.page >= pagination.totalPages"
          :class="pagination.page >= pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''"
        >
          Page suivante
        </button>
        <span v-if="pagination.total">({{ pagination.total }} compteurs au total)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useMeterStore } from '@/stores/meter.store';
import { useNotificationStore } from '@/stores/notification.store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const router = useRouter();
const meterStore = useMeterStore();
const notificationStore = useNotificationStore();

// Récupérer les états du store avec storeToRefs pour garantir la réactivité
const { meters, isLoading, pagination } = storeToRefs(meterStore);

// État local
const showAddModal = ref(false);
const stats = ref(null);
const filters = reactive({
  statut: '',
  calibre: '',
  zone: '',
  search: ''
});

// Chargement initial
onMounted(async () => {
  try {
    await meterStore.listMeters();
    stats.value = {
      total: 0,
      actifs: 0,
      inactifs: 0
    };
  } catch (error) {
    console.error('Erreur chargement compteurs:', error);
  }
});

// Méthodes
const applyFilters = async () => {
  try {
    await meterStore.listMeters(filters);
  } catch (error) {
    console.error('Erreur application filtres:', error);
  }
};

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = '';
  });
  applyFilters();
};

const viewMeter = (meter) => {
  router.push(`/dashboard/compteurs/${meter.id}`);
};

const editMeter = (meter) => {
  router.push(`/dashboard/compteurs/${meter.id}/edit`);
};

const confirmDeleteMeter = (meter) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le compteur ${meter.numero} ?`)) {
    // TODO: Appeler l'API pour supprimer le compteur
    notificationStore.success('Succès', `Le compteur ${meter.numero} a été supprimé.`);
    meterStore.listMeters(filters); // Recharger la liste
  }
};

const nextPage = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    meterStore.setPage(pagination.value.page + 1);
    meterStore.listMeters({ ...filters, page: pagination.value.page });
  }
};

const prevPage = () => {
  if (pagination.value.page > 1) {
    meterStore.setPage(pagination.value.page - 1);
    meterStore.listMeters({ ...filters, page: pagination.value.page });
  }
};

// Utilitaires
const getStatusClass = (statut) => {
  switch (statut) {
    case 'ACTIF':
      return 'bg-green-100 text-green-800';
    case 'EN_STOCK':
      return 'bg-blue-100 text-blue-800';
    case 'INSTALLÉ':
      return 'bg-purple-100 text-purple-800';
    case 'DÉFECTUEUX':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (statut) => {
  switch (statut) {
    case 'ACTIF':
      return 'Actif';
    case 'EN_STOCK':
      return 'En stock';
    case 'INSTALLÉ':
      return 'Installé';
    case 'DÉFECTUEUX':
      return 'Défectueux';
    default:
      return statut;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  } catch (e) {
    return dateString;
  }
};
</script>
