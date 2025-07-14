<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Historique d'audit</h3>
    
    <div v-if="loading" class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="auditTrail.length === 0" class="text-sm text-gray-500">
      Aucun événement d'audit disponible pour ce contrat
    </div>
    
    <div v-else class="flow-root">
      <ul role="list" class="-mb-8">
        <li v-for="(event, index) in auditTrail" :key="event.id">
          <div class="relative pb-8">
            <span v-if="index !== auditTrail.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
            <div class="relative flex space-x-3">
              <div>
                <span 
                  class="h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white"
                  :class="getEventIconClass(event.action)"
                >
                  <i :class="getEventIcon(event.action)" class="h-4 w-4 text-white"></i>
                </span>
              </div>
              <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                <div>
                  <p class="text-sm text-gray-900">
                    <strong>{{ event.action }}</strong>
                    <span class="ml-1 text-gray-600">{{ event.details }}</span>
                  </p>
                </div>
                <div class="whitespace-nowrap text-right text-sm text-gray-500">
                  <div>{{ formatDate(event.timestamp) }}</div>
                  <div class="text-xs">par {{ event.userId || 'Système' }}</div>
                  <div v-if="event.ipAddress" class="text-xs text-gray-400">{{ event.ipAddress }}</div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    
    <div v-if="auditTrail.length > 0 && totalPages > 1" class="flex justify-center mt-4 space-x-2">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="px-3 py-1 border rounded text-sm"
        :class="currentPage === 1 ? 'border-gray-200 text-gray-400' : 'border-blue-500 text-blue-500 hover:bg-blue-50'"
      >
        Précédent
      </button>
      <button 
        v-for="page in pageNumbers" 
        :key="page" 
        @click="changePage(page)"
        class="px-3 py-1 border rounded text-sm"
        :class="page === currentPage ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:bg-gray-50'"
      >
        {{ page }}
      </button>
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="px-3 py-1 border rounded text-sm"
        :class="currentPage === totalPages ? 'border-gray-200 text-gray-400' : 'border-blue-500 text-blue-500 hover:bg-blue-50'"
      >
        Suivant
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useContractStore } from '@/stores/contract.store';
import type { ContractAudit } from '@/types/contract.types';

const props = defineProps<{
  contratId: string;
}>();

const contractStore = useContractStore();
const loading = ref(false);
const auditTrail = computed<ContractAudit[]>(() => contractStore.getContractAudit);
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);

// Calculer le nombre total de pages
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize));

// Générer les numéros de page à afficher
const pageNumbers = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  
  // Si le nombre de pages est inférieur ou égal au nombre de pages visibles, on affiche toutes les pages
  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Sinon, on affiche les premières pages, la page courante et les dernières pages
    if (currentPage.value <= 3) {
      // Cas où on est près du début
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
    } else if (currentPage.value >= totalPages.value - 2) {
      // Cas où on est près de la fin
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) {
        pages.push(i);
      }
    } else {
      // Cas où on est au milieu
      for (let i = currentPage.value - 2; i <= currentPage.value + 2; i++) {
        pages.push(i);
      }
    }
  }
  
  return pages;
});

// Formatter les dates
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

// Définir la classe d'icône en fonction de l'action
const getEventIconClass = (action: string): string => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('create') || actionLower.includes('créa')) {
    return 'bg-green-500';
  } else if (actionLower.includes('update') || actionLower.includes('modif') || actionLower.includes('maj')) {
    return 'bg-blue-500';
  } else if (actionLower.includes('delete') || actionLower.includes('suppr')) {
    return 'bg-red-500';
  } else if (actionLower.includes('sign') || actionLower.includes('signa')) {
    return 'bg-purple-500';
  } else if (actionLower.includes('invit')) {
    return 'bg-yellow-500';
  } else if (actionLower.includes('suspend')) {
    return 'bg-orange-500';
  } else if (actionLower.includes('final')) {
    return 'bg-green-700';
  } else if (actionLower.includes('terminat') || actionLower.includes('résili')) {
    return 'bg-red-700';
  } else {
    return 'bg-gray-500';
  }
};

// Définir l'icône en fonction de l'action
const getEventIcon = (action: string): string => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('create') || actionLower.includes('créa')) {
    return 'fas fa-plus';
  } else if (actionLower.includes('update') || actionLower.includes('modif') || actionLower.includes('maj')) {
    return 'fas fa-edit';
  } else if (actionLower.includes('delete') || actionLower.includes('suppr')) {
    return 'fas fa-trash';
  } else if (actionLower.includes('sign') || actionLower.includes('signa')) {
    return 'fas fa-signature';
  } else if (actionLower.includes('invit')) {
    return 'fas fa-envelope';
  } else if (actionLower.includes('suspend')) {
    return 'fas fa-pause';
  } else if (actionLower.includes('final')) {
    return 'fas fa-check-double';
  } else if (actionLower.includes('terminat') || actionLower.includes('résili')) {
    return 'fas fa-times-circle';
  } else {
    return 'fas fa-history';
  }
};

// Fonction pour changer de page
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  loadAuditTrail();
};

// Charger l'historique d'audit
const loadAuditTrail = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize
    };
    
    const response = await contractStore.fetchAuditTrail(props.contratId, params);
    totalItems.value = response?.total || auditTrail.value.length;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique d\'audit', error);
  } finally {
    loading.value = false;
  }
};

// Charger l'historique d'audit au montage du composant
onMounted(() => {
  loadAuditTrail();
});

// Recharger l'historique d'audit quand l'ID du contrat change
watch(() => props.contratId, (newId) => {
  if (newId) {
    currentPage.value = 1;
    loadAuditTrail();
  }
});
</script>
