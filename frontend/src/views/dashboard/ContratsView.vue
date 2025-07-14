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
          @click="showWizard = true"
        >
          <i class="fas fa-plus"></i> Nouveau contrat
        </button>
      </div>
      <div v-if="loading" class="text-center py-12">
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
            <tr v-for="contrat in contrats" :key="contrat.id" class="hover:bg-blue-50 transition">
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
                <button class="text-blue-600 hover:text-blue-900 transition" @click="showDetail(contrat)" title="Voir détails"><i class="fas fa-eye"></i></button>
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
                  @click="confirmDeleteDraft(contrat)"
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
        <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="prevPage" :disabled="page === 1">Page précédente</button>
        <span class="mx-4">Page {{ page }}</span>
        <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="nextPage" :disabled="contrats.length < pageSize">Page suivante</button>
        <span v-if="total">({{ total }} contrats au total)</span>
      </div>
      <AddContratModal v-if="showAddModal" @close="showAddModal = false" @created="fetchContrats(lastFilters)" />
      <ConfirmationModal
        v-if="showConfirmDelete"
        title="Supprimer le brouillon ?"
        :message="`Le contrat ${contratToDelete?.numero} sera définitivement supprimé.`"
        confirm-text="Supprimer"
        cancel-text="Annuler"
        @confirm="executeDelete"
        @cancel="showConfirmDelete = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '@/components/ui/SearchBar.vue'
import AddContratModal from '@/components/contrats/AddContratModal.vue'
import CreateContractWizard from '@/views/contracts/CreateContractWizard.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'
import apiClient, { getContratById } from '@/services/api.service'
import { useContractDraftStore } from "@/stores/contract-draft.store";
import { useUserStore } from "@/stores/user.store";
import { useClientStore } from "@/stores/client.store";

const router = useRouter()
const contrats = ref<any[]>([])
const loading = ref(false)
const showAddModal = ref(false)
const showWizard = ref(false)
const detailLoading = ref(false)
const showConfirmDelete = ref(false)
const contratToDelete = ref<any|null>(null)
const userStore = useUserStore()
const clientStore = useClientStore()

const page = ref(1)
const pageSize = 10
const total = ref(0)

const searchFields: Array<{
  name: string;
  label: string;
  type: 'text' | 'select' | 'date';
  placeholder?: string;
  options?: { value: string; label: string }[];
}> = [
  { name: 'numero', label: 'Numéro', type: 'text', placeholder: 'Numéro du contrat' },
  { name: 'typeProprietaire', label: 'Type propriétaire', type: 'select', options: [
    { value: 'UTILISATEUR', label: 'Utilisateur' },
    { value: 'ENTREPRISE', label: 'Entreprise' },
    { value: 'CLIENT', label: 'Client' }
  ] },
  { name: 'proprietaireNom', label: 'Nom propriétaire', type: 'text', placeholder: 'Nom du propriétaire' },
  { name: 'proprietaireId', label: 'ID propriétaire', type: 'text', placeholder: 'UUID propriétaire' },
  { name: 'cosignataireId', label: 'ID cosignataire', type: 'text', placeholder: 'UUID cosignataire' },
  { name: 'compteurId', label: 'ID compteur', type: 'text', placeholder: 'UUID compteur' },
  { name: 'statut', label: 'Statut', type: 'select', options: [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'ACTIF', label: 'Actif' },
    { value: 'SUSPENDU', label: 'Suspendu' },
    { value: 'RESILIE', label: 'Résilié' }
  ] },
  { name: 'dateDebut', label: 'Date début', type: 'date' },
  { name: 'dateFin', label: 'Date fin', type: 'date' }
]

let lastFilters: Record<string, any> = {}

async function fetchContrats(filters: Record<string, any> = {}) {
  loading.value = true
  lastFilters = { ...filters }
  try {
    const res = await apiClient.get('/contrats', { params: { ...filters, page: page.value, pageSize } })

    const payload = res.data || {}

    // Supporte les trois formats possibles de réponse API
    const items = Array.isArray(payload.items) 
      ? payload.items 
      : (Array.isArray(payload.data) 
        ? payload.data 
        : (payload.data && Array.isArray(payload.data.contrats) 
          ? payload.data.contrats 
          : []))
    
    // Obtenir le total depuis les différentes structures possibles
    total.value = typeof payload.total === 'number' 
      ? payload.total 
      : (payload.data && typeof payload.data.total === 'number' 
        ? payload.data.total 
        : items.length)

    // Obtenir les données des contrats avant d'enrichir avec les infos propriétaires
    contrats.value = items
    
    console.log('Contrats récupérés:', contrats.value);
    
    // Enrichir avec les infos des propriétaires
    await enrichOwnerInfo()
  } catch (e) {
    contrats.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onSearch(filters: Record<string, any>) {
  page.value = 1
  fetchContrats(filters)
}

function nextPage() {
  if (contrats.value.length < pageSize) return
  page.value++
  fetchContrats(lastFilters)
}
function prevPage() {
  if (page.value === 1) return
  page.value--
  fetchContrats(lastFilters)
}

function showDetail(contrat: any) {
  // Naviguer vers la page de détail du contrat dans le layout dashboard
  router.push(`/dashboard/contrats/${contrat.id}`);
}

function closeWizard() {
  showWizard.value = false
}

function onWizardCompleted(contrat: any) {
  showWizard.value = false
  // Recharger la liste des contrats
  fetchContrats(lastFilters)
  // Optionnel : afficher un message de succès
  console.log('Contrat créé avec succès:', contrat)
}

const draftStore = useContractDraftStore()
const wizardRef = ref<any>(null)

async function resumeDraft(contrat: any) {
  await draftStore.reset()
  await draftStore.loadDraft(contrat.id)
  showWizard.value = true
  nextTick(() => {
    wizardRef.value?.goToStep(draftStore.firstIncompleteStep())
  })
}

function confirmDeleteDraft(contrat: any) {
  contratToDelete.value = contrat
  showConfirmDelete.value = true
}

async function executeDelete() {
  if (!contratToDelete.value) return
  showConfirmDelete.value = false

  try {
    await apiClient.delete(`/contrats/${contratToDelete.value.id}`)
    await fetchContrats()
  } catch (e) {
    window.alert('Erreur: suppression impossible')
  } finally {
    contratToDelete.value = null
  }
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

// Fonction pour enrichir les contrats avec les informations des propriétaires
async function enrichOwnerInfo() {
  // Créer un cache pour éviter de récupérer plusieurs fois le même propriétaire
  const ownerCache: Record<string, any> = {}
  
  const enrichTasks = contrats.value.map(async (contrat) => {
    if (!contrat.proprietaireId) {
      // Si pas d'ID propriétaire, on ajoute des valeurs par défaut
      contrat.proprietaireNom = 'Non spécifié';
      contrat.proprietaireEmail = '-';
      contrat.proprietaireTelephone = '-';
      return contrat;
    }
    
    // Si l'ID est déjà en cache comme "non trouvé", ne pas réessayer
    if (ownerCache[contrat.proprietaireId] === 'NOT_FOUND') {
      contrat.proprietaireNom = 'Propriétaire inconnu';
      contrat.proprietaireEmail = '-';
      contrat.proprietaireTelephone = '-';
      return contrat;
    }
    
    try {
      // Vérifier si on a déjà les infos de ce propriétaire en cache
      if (!ownerCache[contrat.proprietaireId]) {
        try {
          let ownerInfo = null;
          
          // Déterminer si c'est un client ou un utilisateur selon le typeProprietaire
          console.log(`Contrat ${contrat.id}: typeProprietaire=${contrat.typeProprietaire}, clientId=${contrat.clientId}, proprietaireId=${contrat.proprietaireId}`);
          
          // Essayer d'abord de récupérer comme client, puis comme utilisateur
          const ownerId = contrat.clientId || contrat.proprietaireId;
          
          // Essayer d'abord comme client
          try {
            console.log(`Tentative: Récupération comme client ${ownerId} pour le contrat ${contrat.id}`);
            ownerInfo = await clientStore.getClientById(ownerId);
            console.log(`Client récupéré:`, ownerInfo);
            if (ownerInfo) {
              ownerCache[contrat.proprietaireId] = {
                nom: ownerInfo.nom || '',
                prenom: ownerInfo.prenom || '',
                email: ownerInfo.email || '',
                telephone: ownerInfo.telephone || ''
              };
            } else {
              // Si pas de client trouvé, marquer comme non trouvé
              ownerCache[contrat.proprietaireId] = 'NOT_FOUND';
            }
          } catch (clientError: any) {
            console.log(`Client ${ownerId} non trouvé`);
            ownerCache[contrat.proprietaireId] = 'NOT_FOUND';
          }
        } catch (error: any) {
          // Si 404, marquer comme non trouvé dans le cache
          if (error?.response?.status === 404) {
            ownerCache[contrat.proprietaireId] = 'NOT_FOUND';
            // Ne pas logger cette erreur pour réduire le bruit dans la console
          } else {
            // Pour les autres erreurs, on les loggue quand même
            console.error(`Erreur lors de la récupération du propriétaire ${contrat.proprietaireId}:`, error);
          }
        }
      }
      
      // Enrichir le contrat avec les infos du propriétaire
      if (ownerCache[contrat.proprietaireId] && ownerCache[contrat.proprietaireId] !== 'NOT_FOUND') {
        const owner = ownerCache[contrat.proprietaireId];
        contrat.proprietaireNom = `${owner.prenom} ${owner.nom}`.trim() || 'N/A';
        contrat.proprietaireEmail = owner.email || '-';
        contrat.proprietaireTelephone = owner.telephone || '-';
      } else {
        // Valeurs par défaut si pas trouvé
        contrat.proprietaireNom = 'Propriétaire inconnu';
        contrat.proprietaireEmail = '-';
        contrat.proprietaireTelephone = '-';
      }
    } catch (error) {
      // Fallback en cas d'erreur inattendue
      console.error(`Erreur inattendue lors de l'enrichissement du contrat:`, error);
      contrat.proprietaireNom = 'Erreur';
      contrat.proprietaireEmail = '-';
      contrat.proprietaireTelephone = '-';
    }
    
    return contrat;
  });
  
  // Attendre que toutes les tâches d'enrichissement soient terminées
  await Promise.allSettled(enrichTasks);
}

fetchContrats()
</script> 