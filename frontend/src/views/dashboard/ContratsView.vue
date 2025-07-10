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
          <CreateContractWizard @completed="onWizardCompleted" @cancelled="closeWizard" />
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
              <td class="px-8 py-4 text-center">
                <button class="text-blue-600 hover:text-blue-900 transition mr-2" @click="showDetail(contrat)"><i class="fas fa-eye"></i></button>
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
      <ContratDetailModal v-if="selectedContrat" :contrat="selectedContrat" @close="selectedContrat = null" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import AddContratModal from '@/components/contrats/AddContratModal.vue'
import ContratDetailModal from '@/components/contrats/ContratDetailModal.vue'
import CreateContractWizard from '@/views/contracts/CreateContractWizard.vue'
import apiClient, { getContratById } from '@/services/api.service'

const contrats = ref<any[]>([])
const loading = ref(false)
const showAddModal = ref(false)
const showWizard = ref(false)
const selectedContrat = ref<any|null>(null)
const detailLoading = ref(false)

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
    { value: 'ENTREPRISE', label: 'Entreprise' }
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
    const res = await apiClient.get('/contracts', { params: { ...filters, page: page.value, pageSize } })
    contrats.value = res.data.items || res.data
    total.value = res.data.total || 0
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

async function showDetail(contrat: any) {
  detailLoading.value = true
  try {
    const res = await getContratById(contrat.id)
    selectedContrat.value = res.data
  } catch (e) {
    selectedContrat.value = contrat // fallback
  } finally {
    detailLoading.value = false
  }
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

function formatDate(date: string | Date | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

fetchContrats()
</script> 