<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestion des clients</h1>
        <p class="text-gray-600">Recherchez et gérez vos clients avec des critères avancés</p>
      </div>
      <button @click="openAdd" class="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
        <i class="fas fa-user-plus"></i> Ajouter un client
      </button>
      <AddClientModal v-if="showAddClientModal" @close="showAddClientModal = false" @created="handleClientCreated" />
      <!-- Recherche avancée conservée -->
      <ClientSearchCard @search="handleSearch" />
      <div class="mt-8">
        <ResourceTable
          :columns="clientTableColumns"
          :data="clients"
          :actions="tableActions"
        />
      </div>
      <DynamicForm
        v-if="showEditModal"
        :fields="clientFormFields"
        :model-value="selectedClient"
        mode="edit"
        @update:modelValue="updateClientModel"
        @submit="submitEditClient"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ClientSearchCard from '@/components/clients/ClientSearchCard.vue'
import AddClientModal from '@/components/clients/AddClientModal.vue'
import ResourceTable from '@/components/ui/ResourceTable.vue'
import DynamicForm from '@/components/ui/DynamicForm.vue'

const clients = ref<any[]>([])
const showAddClientModal = ref(false)
const showEditModal = ref(false)
const selectedClient = ref<any|null>(null)

function openAdd() {
  showAddClientModal.value = true
}
function handleClientCreated() {
  // Recharger la liste après ajout
}
function handleSearch(filters: any) {
  // Appel API réel ici
  // clients.value = await api.searchClients(filters)
  // Simulation de résultats pour la démo
  clients.value = [
    {
      id: '1', nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@email.com', telephone: '01 23 45 67 89', statut: 'ACTIF',
      adresse: { ligne1: '123 Rue de la Paix', codePostal: '75001', ville: 'Paris' },
      contrat: { numero: 'CON-2024-001', dateDebut: '2024-01-15' },
      compteur: { serial: 'COMP-001', type: 'EAU_FROIDE' }
    },
    {
      id: '2', nom: 'Martin', prenom: 'Marie', email: 'marie.martin@email.com', telephone: '01 98 76 54 32', statut: 'EN_ATTENTE_VALIDATION',
      adresse: { ligne1: '456 Avenue des Champs', codePostal: '75008', ville: 'Paris' },
      contrat: { numero: 'CON-2024-002', dateDebut: '2024-02-01' },
      compteur: { serial: 'COMP-002', type: 'EAU_CHAUDE' }
    }
  ]
}

const clientTableColumns = [
  { key: 'nom', label: 'Nom', render: (row: any) => `${row.prenom} ${row.nom}` },
  { key: 'email', label: 'Email' },
  { key: 'telephone', label: 'Téléphone' },
  { key: 'adresse', label: 'Adresse', render: (row: any) => row.adresse ? `${row.adresse.ligne1}, ${row.adresse.codePostal} ${row.adresse.ville}` : '-' },
  { key: 'contrat', label: 'Contrat', render: (row: any) => row.contrat?.numero || '-' },
  { key: 'compteur', label: 'Compteur', render: (row: any) => row.compteur?.serial || '-' },
  { key: 'statut', label: 'Statut' }
]

const tableActions = [
  { icon: 'fas fa-eye', label: 'Voir', handler: (row: any) => viewClient(row) },
  { icon: 'fas fa-edit', label: 'Modifier', handler: (row: any) => editClient(row) },
  { icon: 'fas fa-trash', label: 'Supprimer', handler: (row: any) => deleteClient(row) }
]

const clientFormFields = [
  { key: 'nom', label: 'Nom', type: 'text' as const, required: true },
  { key: 'prenom', label: 'Prénom', type: 'text' as const, required: true },
  { key: 'email', label: 'Email', type: 'text' as const, required: true },
  { key: 'telephone', label: 'Téléphone', type: 'text' as const },
  { key: 'statut', label: 'Statut', type: 'select' as const, options: [
    { value: 'ACTIF', label: 'Actif' },
    { value: 'EN_ATTENTE_VALIDATION', label: 'En attente de validation' },
    { value: 'SUSPENDU', label: 'Suspendu' }
  ] },
  // Ajouter d'autres champs si besoin
]

function viewClient(client: any) {
  selectedClient.value = { ...client }
  showEditModal.value = true
}
function editClient(client: any) {
  selectedClient.value = { ...client }
  showEditModal.value = true
}
function deleteClient(client: any) {
  // Appel API suppression
  clients.value = clients.value.filter(c => c.id !== client.id)
}
function updateClientModel(val: any) {
  selectedClient.value = val
}
function submitEditClient() {
  // Appel API pour sauvegarder les modifications
  showEditModal.value = false
}
</script> 