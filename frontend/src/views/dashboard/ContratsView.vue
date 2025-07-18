<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-extrabold mb-6 text-blue-800 flex items-center gap-2">
        <i class="fas fa-file-contract"></i> Gestion des contrats
      </h1>
      
      <!-- Wizard de création de contrat -->
      <div v-if="showWizard" class="mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Création de contrat</h2>
            <button 
              @click="closeWizard"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <CreateContractWizard
            ref="wizardRef"
            :form-data="draftStore.formData.value"
            @completed="onWizardCompleted"
            @cancelled="closeWizard" />
        </div>
      </div>

      <div class="mb-6">
        <SearchBar :fields="searchFields" @search="onSearch" />
      </div>
      <div class="flex justify-end mb-4">
        <button 
          class="px-5 py-2 rounded bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-500 transition flex items-center gap-2" 
          @click="createNewContract"
        >
          <i class="fas fa-plus"></i> Nouveau contrat
        </button>
      </div>
      <div v-if="isLoading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
        <p class="text-gray-500">Chargement des contrats...</p>
      </div>
      <div v-else class="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-base">
          <thead class="bg-blue-50">
            <tr>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Numéro</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Type</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Propriétaire</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Statut</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Date début</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Date fin</th>
              <th class="px-8 py-4 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="contrat in paginatedContrats" :key="contrat.id" class="hover:bg-blue-50 transition">
              <td class="px-8 py-4 font-mono text-blue-900">{{ contrat.numero }}</td>
              <td class="px-8 py-4">{{ contrat.typeProprietaire }}</td>
              <td class="px-8 py-4">{{ contrat.proprietaireNom || '-' }}</td>
              <td class="px-8 py-4">
                <span :class="{
                  'bg-green-100 text-green-700 px-2 py-1 rounded text-xs': contrat.statut === 'ACTIF',
                  'bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs': contrat.statut === 'EN_ATTENTE',
                  'bg-red-100 text-red-700 px-2 py-1 rounded text-xs': contrat.statut === 'SUSPENDU' || contrat.statut === 'RESILIE'
                }">
                  {{ contrat.statut }}
                </span>
              </td>
              <td class="px-8 py-4">{{ formatDate(contrat.dateDebut) }}</td>
              <td class="px-8 py-4">{{ formatDate(contrat.dateFin) }}</td>
              <td class="px-8 py-4 text-center flex gap-2 justify-center">
                <button class="text-blue-600 hover:text-blue-900 transition" @click="viewContractDetails(contrat)" title="Voir détails"><i class="fas fa-eye"></i></button>
                <button 
                  v-if="contrat.statut === 'EN_ATTENTE'" 
                  class="text-green-600 hover:text-green-800 transition" 
                  @click="resumeDraft(contrat)" 
                  title="Reprendre">
                  <i class="fas fa-play"></i>
                </button>
                <button
                  v-if="contrat.statut === 'EN_ATTENTE'"
                  class="text-red-600 hover:text-red-800 transition"
                  @click="confirmDelete(contrat)"
                  title="Supprimer brouillon">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="contrats.length === 0">
              <td colspan="7" class="text-center text-gray-400 py-8">Aucun contrat trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-between items-center mt-6" v-if="contrats.length > 0">
        <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Page précédente</button>
        <span class="mx-4">Page {{ currentPage }} / {{ totalPages }}</span>
        <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Page suivante</button>
        <span v-if="totalItems">({{ totalItems }} contrats au total)</span>
      </div>
      <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
        <template #title>
          Supprimer le brouillon ?
        </template>
        <template #content>
          Êtes-vous sûr de vouloir supprimer le brouillon {{ selectedContrat.numero }} ?
        </template>
        <template #footer>
          <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" @click="deleteContract">Supprimer</button>
          <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded" @click="showDeleteModal = false">Annuler</button>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '@/stores/client.store'
import { useContractV2Store } from '@/stores/contract-v2.store'
import { useNotificationStore } from '@/stores/notification.store'
import { useDraftStore } from '@/stores/draft.store'
import Modal from '@/components/ui/ConfirmationModal.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import CreateContractWizard from '@/components/contracts/CreateContractWizard.vue'

// Stores
const clientStore = useClientStore()
const contractV2Store = useContractV2Store()
const notificationStore = useNotificationStore()
const draftStore = useDraftStore()
const router = useRouter()

// État local
const contrats = ref<any[]>([])
const filteredContrats = ref<any[]>([])
const isLoading = ref(false)
const showWizard = ref(false)
const showDeleteModal = ref(false)
const selectedContrat = ref<any>(null)
const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('dateCreation')
const sortOrder = ref('desc')
const wizardRef = ref<any>(null)

// Définition des champs de recherche pour le SearchBar
const searchFields = ref([
  {
    name: 'search',
    label: 'Recherche',
    type: 'text',
    placeholder: 'Numéro, nom du client...'
  },
  {
    name: 'status',
    label: 'Statut',
    type: 'select',
    options: [
      { value: 'all', label: 'Tous' },
      { value: 'BROUILLON', label: 'Brouillon' },
      { value: 'VALIDE', label: 'Validé' },
      { value: 'SIGNE', label: 'Signé' },
      { value: 'RESILIE', label: 'Résilié' }
    ]
  },
  {
    name: 'dateRange',
    label: 'Période',
    type: 'select',
    options: [
      { value: 'all', label: 'Toutes les périodes' },
      { value: 'current', label: 'Contrats en cours' },
      { value: 'expired', label: 'Contrats expirés' },
      { value: 'future', label: 'Contrats à venir' }
    ]
  }
])

// Gestionnaire de recherche pour le SearchBar
const onSearch = (filters: any) => {
  searchQuery.value = filters.search || ''
  statusFilter.value = filters.status || 'all'
  
  // Gestion du filtre de date
  if (filters.dateRange) {
    const today = new Date()
    
    switch (filters.dateRange) {
      case 'current':
        // Filtrer les contrats en cours (date de début <= aujourd'hui <= date de fin)
        filteredContrats.value = contrats.value.filter(contrat => {
          const startDate = new Date(contrat.dateDebut)
          const endDate = new Date(contrat.dateFin)
          return startDate <= today && today <= endDate
        })
        break
      case 'expired':
        // Filtrer les contrats expirés (date de fin < aujourd'hui)
        filteredContrats.value = contrats.value.filter(contrat => {
          const endDate = new Date(contrat.dateFin)
          return endDate < today
        })
        break
      case 'future':
        // Filtrer les contrats à venir (date de début > aujourd'hui)
        filteredContrats.value = contrats.value.filter(contrat => {
          const startDate = new Date(contrat.dateDebut)
          return startDate > today
        })
        break
      default:
        // Cas 'all' ou autre : appliquer les autres filtres
        filterContrats()
        return
    }
    
    // Appliquer les filtres de recherche et de statut sur le résultat filtré par date
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filteredContrats.value = filteredContrats.value.filter(contrat => 
        (contrat.id && contrat.id.toLowerCase().includes(query)) ||
        (contrat.client && contrat.client.nom && contrat.client.nom.toLowerCase().includes(query)) ||
        (contrat.client && contrat.client.prenom && contrat.client.prenom.toLowerCase().includes(query))
      )
    }
    
    if (statusFilter.value !== 'all') {
      filteredContrats.value = filteredContrats.value.filter(contrat => contrat.statut === statusFilter.value)
    }
    
    // Appliquer le tri
    applySorting()
  } else {
    filterContrats()
  }
  
  // Revenir à la première page
  currentPage.value = 1
}

// Appliquer le tri aux contrats filtrés
const applySorting = () => {
  filteredContrats.value.sort((a, b) => {
    let valA, valB
    
    switch (sortBy.value) {
      case 'dateCreation':
        valA = new Date(a.createdAt || a.dateCreation).getTime()
        valB = new Date(b.createdAt || b.dateCreation).getTime()
        break
      case 'client':
        valA = a.client ? `${a.client.nom} ${a.client.prenom}`.toLowerCase() : ''
        valB = b.client ? `${b.client.nom} ${b.client.prenom}`.toLowerCase() : ''
        break
      case 'statut':
        valA = a.statut
        valB = b.statut
        break
      default:
        valA = a[sortBy.value]
        valB = b[sortBy.value]
    }
    
    if (valA === valB) return 0
    const direction = sortOrder.value === 'asc' ? 1 : -1
    return valA > valB ? direction : -direction
  })
}

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = computed(() => contractV2Store.pagination.total)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const paginatedContrats = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredContrats.value.slice(start, end)
})

// Mapping des statuts entre le format v2 et le format attendu par l'interface
const statusMapping = {
  'DRAFT': 'BROUILLON',
  'VALIDATED': 'VALIDE',
  'SIGNED': 'SIGNE',
  'TERMINATED': 'RESILIE'
}

// Filtres
const filterContrats = () => {
  let filtered = [...contrats.value]
  
  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(contrat => 
      (contrat.id && contrat.id.toLowerCase().includes(query)) ||
      (contrat.client && contrat.client.nom && contrat.client.nom.toLowerCase().includes(query)) ||
      (contrat.client && contrat.client.prenom && contrat.client.prenom.toLowerCase().includes(query))
    )
  }
  
  // Filtre par statut
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(contrat => contrat.statut === statusFilter.value)
  }
  
  // Tri
  filtered.sort((a, b) => {
    let valA, valB
    
    switch (sortBy.value) {
      case 'dateCreation':
        valA = new Date(a.createdAt || a.dateCreation).getTime()
        valB = new Date(b.createdAt || b.dateCreation).getTime()
        break
      case 'client':
        valA = a.client ? `${a.client.nom} ${a.client.prenom}`.toLowerCase() : ''
        valB = b.client ? `${b.client.nom} ${b.client.prenom}`.toLowerCase() : ''
        break
      case 'statut':
        valA = a.statut
        valB = b.statut
        break
      default:
        valA = a[sortBy.value]
        valB = b[sortBy.value]
    }
    
    if (valA === valB) return 0
    const direction = sortOrder.value === 'asc' ? 1 : -1
    return valA > valB ? direction : -direction
  })
  
  filteredContrats.value = filtered
}

// Changement de page
const changePage = (page: number) => {
  currentPage.value = page
}

// Récupération des contrats
const fetchContrats = async () => {
  isLoading.value = true
  try {
    // Utilisation du store contract-v2 pour récupérer les contrats
    await contractV2Store.listContracts({
      page: currentPage.value,
      limit: itemsPerPage.value,
      status: statusFilter.value !== 'all' ? Object.keys(statusMapping).find(key => statusMapping[key as keyof typeof statusMapping] === statusFilter.value) : undefined,
      search: searchQuery.value || undefined
    })
    
    // Mapper les contrats du format v2 vers le format attendu par l'interface
    contrats.value = contractV2Store.contracts.map((contract: any) => ({
      id: contract.id,
      statut: statusMapping[contract.status as keyof typeof statusMapping] || contract.status,
      dateCreation: contract.createdAt,
      dateDebut: contract.startDate,
      dateFin: contract.endDate,
      clientId: contract.clientId,
      compteurId: contract.meterId,
      prix: contract.price,
      periodicite: contract.periodicity,
      templateId: contract.templateId,
      agenceId: contract.agencyId,
      // Ajout d'une propriété pour identifier les contrats v2
      isV2: true
    }))
    
    // Enrichir les contrats avec les informations des clients
    await enrichContratsWithClientInfo()
    
    filterContrats()
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error)
    notificationStore.error('Erreur', 'Impossible de récupérer la liste des contrats')
  } finally {
    isLoading.value = false
  }
}

// Enrichir les contrats avec les informations des clients
const enrichContratsWithClientInfo = async () => {
  const clientIds = contrats.value
    .filter(c => c.clientId)
    .map(c => c.clientId)
  
  if (clientIds.length === 0) return
  
  // Récupérer les clients en parallèle
  const enrichTasks = contrats.value
    .filter(c => c.clientId)
    .map(async (contrat) => {
      try {
        const client = await clientStore.getClientById(contrat.clientId)
        contrat.client = client
      } catch (error) {
        console.error(`Erreur lors de la récupération du client ${contrat.clientId}:`, error)
      }
    })
  
  await Promise.allSettled(enrichTasks)
}

// Voir les détails d'un contrat
const viewContractDetails = (contrat: any) => {
  if (contrat.isV2) {
    router.push(`/dashboard/contrats/v2/${contrat.id}`)
  } else {
    router.push(`/dashboard/contrats/${contrat.id}`)
  }
}

// Ouvrir le wizard de création de contrat
const createNewContract = () => {
  showWizard.value = true
}

// Fermer le wizard de création de contrat
const closeWizard = () => {
  showWizard.value = false
  // Effacer le brouillon si nécessaire
  draftStore.clearDraft()
}

// Gérer la complétion du wizard
const onWizardCompleted = (contractData: any) => {
  showWizard.value = false
  draftStore.clearDraft()
  // Rafraîchir la liste des contrats
  fetchContrats()
}

// Supprimer un contrat (brouillon)
const deleteContract = async () => {
  if (!selectedContrat.value) return
  
  isLoading.value = true
  try {
    // Pour les contrats v2, utiliser la méthode de résiliation
    await contractV2Store.terminateContract(selectedContrat.value.id, 'Suppression du brouillon')
    notificationStore.success('Succès', 'Le brouillon a été supprimé avec succès')
    showDeleteModal.value = false
    selectedContrat.value = null
    fetchContrats()
  } catch (error) {
    console.error('Erreur lors de la suppression du contrat:', error)
    notificationStore.error('Erreur', 'Impossible de supprimer le brouillon')
  } finally {
    isLoading.value = false
  }
}

// Confirmer la suppression d'un contrat
const confirmDelete = (contrat: any) => {
  selectedContrat.value = contrat
  showDeleteModal.value = true
}

// Reprendre l'édition d'un brouillon
const resumeDraft = (contrat: any) => {
  if (contrat.isV2) {
    router.push(`/dashboard/contrats/v2/${contrat.id}`)
  } else {
    router.push(`/dashboard/contrats/${contrat.id}`)
  }
}

// Initialisation
onMounted(() => {
  fetchContrats()
})

// Watcher pour les filtres
watch([searchQuery, statusFilter, sortBy, sortOrder], () => {
  filterContrats()
})

// Fonction de formatage de date
function formatDate(date: string | Date | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}
</script>