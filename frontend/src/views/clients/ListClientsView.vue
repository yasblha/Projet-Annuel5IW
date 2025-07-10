<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-extrabold mb-6 text-blue-800 flex items-center gap-2">
        <i class="fas fa-users"></i> Gestion des clients
      </h1>
      <div class="mb-6">
        <ClientSearchCard @search="onSearch" />
      </div>
      <div class="flex justify-end mb-4">
        <button class="px-5 py-2 rounded bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-500 transition flex items-center gap-2" @click="showAddModal = true">
          <i class="fas fa-plus"></i> Ajouter un client
        </button>
      </div>
      <div v-if="isLoading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
        <p class="text-gray-500">Chargement des clients...</p>
      </div>
      <div v-else class="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-base">
          <thead class="bg-blue-50">
            <tr>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Client</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Email</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Téléphone</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Type</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Statut</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Date création</th>
              <th class="px-8 py-4 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="client in displayedClients" :key="client.id" class="hover:bg-blue-50 transition">
              <td class="px-8 py-4">
                <div class="font-medium text-blue-900">{{ client.prenom }} {{ client.nom }}</div>
              </td>
              <td class="px-8 py-4">{{ client.email }}</td>
              <td class="px-8 py-4">{{ client.telephone || '-' }}</td>
              <td class="px-8 py-4">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="client.type === 'PARTICULIER' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                  {{ client.type === 'PARTICULIER' ? 'Particulier' : 'Entreprise' }}
                </span>
              </td>
              <td class="px-8 py-4">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getStatusClass(client.statut)">
                  {{ getStatusLabel(client.statut) }}
                </span>
              </td>
              <td class="px-8 py-4 text-sm text-gray-500">{{ formatDate(client.dateCreation) }}</td>
              <td class="px-8 py-4 text-center">
                <button class="text-blue-600 hover:text-blue-900 transition mr-2" @click="openDrawer(client)" title="Voir">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="text-green-600 hover:text-green-900 transition mr-2" @click="editClient(client)" title="Modifier">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-900 transition" @click="deleteClient(client)" title="Supprimer">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="displayedClients.length === 0">
              <td colspan="7" class="text-center text-gray-400 py-8">Aucun client trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-between items-center mt-6" v-if="getPagination.total > 0">
        <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="prevPage" :disabled="getPagination.page <= 1">Page précédente</button>
        <span class="mx-4">Page {{ getPagination.page }} sur {{ getPagination.totalPages }}</span>
        <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="nextPage" :disabled="getPagination.page >= getPagination.totalPages">Page suivante</button>
        <span v-if="getPagination.total">({{ getPagination.total }} clients au total)</span>
      </div>
      <AddClientModal v-if="showAddModal" @close="showAddModal = false" @created="handleClientCreated" />
      <!-- Drawer détail client -->
      <ClientDetailDrawer v-if="drawerClient" :client="drawerClient" @close="closeDrawer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useClientStore } from '@/stores/client.store';
import { storeToRefs } from 'pinia';
import ClientSearchCard from '@/components/clients/ClientSearchCard.vue';
import AddClientModal from '@/components/clients/AddClientModal.vue';
import ClientDetailDrawer from '@/components/clients/ClientDetailDrawer.vue';

const clientStore = useClientStore();
const showAddModal = ref(false);
const drawerClient = ref(null);

// Utilise storeToRefs pour garantir la réactivité sur les states, mais garde les actions du store
const { clients, getClients, isLoading, getPagination } = storeToRefs(clientStore);
const listClients = clientStore.listClients;
const deleteClientAction = clientStore.deleteClient;

// Fallback pour affichage si getClients est vide mais clients contient des données
const displayedClients = computed(() => {
  if (getClients.value && getClients.value.length > 0) return getClients.value;
  if (clients.value && clients.value.length > 0) return clients.value;
  return [];
});

let lastFilters: Record<string, any> = {};

// Gestionnaires d'événements
const onSearch = (filters: Record<string, any>) => {
  lastFilters = { ...filters };
  loadClients();
};

const loadClients = async () => {
  try {
    await listClients({
      ...lastFilters,
      page: getPagination.value.page,
      limit: getPagination.value.limit
    });
  } catch (error) {
    console.error('Erreur lors du chargement des clients:', error);
  }
};

const handleClientCreated = () => {
  showAddModal.value = false;
  loadClients(); // Recharger la liste
};

// Debug : log le contenu de getClients à chaque changement
watch(getClients, (val) => {
  console.log('getClients (watch):', val);
});

const prevPage = () => {
  if (getPagination.value.page > 1) {
    listClients({
      ...lastFilters,
      page: getPagination.value.page - 1,
      limit: getPagination.value.limit
    });
  }
};

const nextPage = () => {
  if (getPagination.value.page < getPagination.value.totalPages) {
    listClients({
      ...lastFilters,
      page: getPagination.value.page + 1,
      limit: getPagination.value.limit
    });
  }
};

const viewClient = (client: any) => {
  // TODO: Implémenter la vue détaillée
  console.log('Voir client:', client);
};

const editClient = (client: any) => {
  // TODO: Implémenter l'édition
  console.log('Modifier client:', client);
};

const deleteClient = async (client: any) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le client ${client.prenom} ${client.nom} ?`)) {
    try {
      await deleteClientAction(client.id);
      loadClients(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }
};

function openDrawer(client: any) {
  drawerClient.value = client;
}
function closeDrawer() {
  drawerClient.value = null;
}

// Utilitaires
const getStatusClass = (statut: string) => {
  switch (statut) {
    case 'ACTIF': return 'bg-green-100 text-green-800';
    case 'INACTIF': return 'bg-gray-100 text-gray-800';
    case 'SUSPENDU': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (statut: string) => {
  switch (statut) {
    case 'ACTIF': return 'Actif';
    case 'INACTIF': return 'Inactif';
    case 'SUSPENDU': return 'Suspendu';
    default: return statut;
  }
};

const getPaiementStatusClass = (statut: string) => {
  switch (statut) {
    case 'A_JOUR': return 'bg-green-100 text-green-800';
    case 'RETARD_LEGER': return 'bg-yellow-100 text-yellow-800';
    case 'RETARD_MODERE': return 'bg-orange-100 text-orange-800';
    case 'RETARD_IMPORTANT': return 'bg-red-100 text-red-800';
    case 'IMPAYE': return 'bg-red-600 text-white';
    case 'EN_PROCEDURE': return 'bg-purple-100 text-purple-800';
    case 'LITIGE': return 'bg-gray-800 text-white';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPaiementStatusLabel = (statut: string) => {
  switch (statut) {
    case 'A_JOUR': return 'À jour';
    case 'RETARD_LEGER': return 'Retard léger';
    case 'RETARD_MODERE': return 'Retard modéré';
    case 'RETARD_IMPORTANT': return 'Retard important';
    case 'IMPAYE': return 'Impayé';
    case 'EN_PROCEDURE': return 'En procédure';
    case 'LITIGE': return 'Litige';
    default: return statut;
  }
};

const getContractStatusClass = (statut: string) => {
  switch (statut) {
    case 'SANS_CONTRAT': return 'bg-gray-100 text-gray-800';
    case 'EN_NEGOCIATION': return 'bg-blue-100 text-blue-800';
    case 'EN_ATTENTE_SIGNATURE': return 'bg-yellow-100 text-yellow-800';
    case 'CONTRAT_ACTIF': return 'bg-green-100 text-green-800';
    case 'CONTRAT_SUSPENDU': return 'bg-orange-100 text-orange-800';
    case 'CONTRAT_RESILIE': return 'bg-red-100 text-red-800';
    case 'CONTRAT_EXPIRE': return 'bg-gray-600 text-white';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getContractStatusLabel = (statut: string) => {
  switch (statut) {
    case 'SANS_CONTRAT': return 'Sans contrat';
    case 'EN_NEGOCIATION': return 'En négociation';
    case 'EN_ATTENTE_SIGNATURE': return 'En attente signature';
    case 'CONTRAT_ACTIF': return 'Contrat actif';
    case 'CONTRAT_SUSPENDU': return 'Contrat suspendu';
    case 'CONTRAT_RESILIE': return 'Contrat résilié';
    case 'CONTRAT_EXPIRE': return 'Contrat expiré';
    default: return statut;
  }
};

const getTechniqueStatusClass = (statut: string) => {
  switch (statut) {
    case 'EN_COURS': return 'bg-blue-100 text-blue-800';
    case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
    case 'TERMINE': return 'bg-green-100 text-green-800';
    case 'ANNULE': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTechniqueStatusLabel = (statut: string) => {
  switch (statut) {
    case 'EN_COURS': return 'En cours';
    case 'EN_ATTENTE': return 'En attente';
    case 'TERMINE': return 'Terminé';
    case 'ANNULE': return 'Annulé';
    default: return statut;
  }
};

const getAbonnementStatusClass = (statut: string) => {
  switch (statut) {
    case 'ACTIF': return 'bg-green-100 text-green-800';
    case 'INACTIF': return 'bg-gray-100 text-gray-800';
    case 'SUSPENDU': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getAbonnementStatusLabel = (statut: string) => {
  switch (statut) {
    case 'ACTIF': return 'Actif';
    case 'INACTIF': return 'Inactif';
    case 'SUSPENDU': return 'Suspendu';
    default: return statut;
  }
};

const getFacturationStatusClass = (statut: string) => {
  switch (statut) {
    case 'A_JOUR': return 'bg-green-100 text-green-800';
    case 'RETARD_LEGER': return 'bg-yellow-100 text-yellow-800';
    case 'RETARD_MODERE': return 'bg-orange-100 text-orange-800';
    case 'RETARD_IMPORTANT': return 'bg-red-100 text-red-800';
    case 'IMPAYE': return 'bg-red-600 text-white';
    case 'EN_PROCEDURE': return 'bg-purple-100 text-purple-800';
    case 'LITIGE': return 'bg-gray-800 text-white';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getFacturationStatusLabel = (statut: string) => {
  switch (statut) {
    case 'A_JOUR': return 'À jour';
    case 'RETARD_LEGER': return 'Retard léger';
    case 'RETARD_MODERE': return 'Retard modéré';
    case 'RETARD_IMPORTANT': return 'Retard important';
    case 'IMPAYE': return 'Impayé';
    case 'EN_PROCEDURE': return 'En procédure';
    case 'LITIGE': return 'Litige';
    default: return statut;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

// Chargement initial
onMounted(() => {
  loadClients();
  // Debug : log initial
  console.log('getClients (onMounted):', getClients);
});
</script> 