<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestion des utilisateurs</h1>
      <p class="text-gray-600">Créez et gérez les utilisateurs de votre système</p>
    </div>

    <!-- Bouton pour ouvrir le modal -->
    <div class="mb-6">
      <button 
        @click="openCreateModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <i class="fas fa-user-plus mr-2"></i>
        Créer un utilisateur
      </button>
    </div>

    <!-- Tableau des utilisateurs -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-800">
                        {{ getInitials(user.nom, user.prenom) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.prenom }} {{ user.nom }}
                    </div>
                    <div class="text-sm text-gray-500">
                      ID: {{ user.id }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
                <div class="text-sm text-gray-500">{{ user.telephone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(user.statut)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusLabel(user.statut) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button 
                    @click="viewUser(user)" 
                    class="text-blue-600 hover:text-blue-900"
                    title="Voir les détails"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    @click="editUser(user)" 
                    class="text-green-600 hover:text-green-900"
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="deleteUser(user)" 
                    class="text-red-600 hover:text-red-900"
                    title="Supprimer"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de création/édition -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- En-tête du modal -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur' }}
            </h3>
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <!-- Formulaire dynamique -->
          <DynamicForm 
            :config="currentFormConfig"
            :initial-data="editingUser || undefined"
            @submit="handleFormSubmit"
            @reset="handleFormReset"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DynamicForm from '@/components/ui/DynamicForm.vue'
import { formConfigs } from '@/config/formConfigs'

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  role: string
  statut: string
}

const users = ref<User[]>([
  {
    id: '1',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    telephone: '01 23 45 67 89',
    role: 'CLIENT',
    statut: 'ACTIF'
  },
  {
    id: '2',
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.martin@email.com',
    telephone: '01 98 76 54 32',
    role: 'ADMIN',
    statut: 'ACTIF'
  }
])

const showModal = ref(false)
const isEditing = ref(false)
const editingUser = ref<User | null>(null)

// Configuration du formulaire selon le mode
const currentFormConfig = computed(() => {
  return isEditing.value ? formConfigs.editUser : formConfigs.createUser
})

function getInitials(nom?: string, prenom?: string): string {
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase()
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'CLIENT':
      return 'Client'
    case 'ADMIN':
      return 'Administrateur'
    case 'TECHNICIEN':
      return 'Technicien'
    default:
      return role
  }
}

function getStatusClass(statut: string): string {
  switch (statut) {
    case 'ACTIF':
      return 'bg-green-100 text-green-800'
    case 'EN_ATTENTE_VALIDATION':
      return 'bg-yellow-100 text-yellow-800'
    case 'SUSPENDU':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(statut: string): string {
  switch (statut) {
    case 'ACTIF':
      return 'Actif'
    case 'EN_ATTENTE_VALIDATION':
      return 'En attente'
    case 'SUSPENDU':
      return 'Suspendu'
    default:
      return statut
  }
}

function openCreateModal() {
  isEditing.value = false
  editingUser.value = null
  showModal.value = true
}

function editUser(user: User) {
  isEditing.value = true
  editingUser.value = { ...user }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  isEditing.value = false
  editingUser.value = null
}

function handleFormSubmit(data: Record<string, any>) {
  if (isEditing.value && editingUser.value) {
    // Mise à jour de l'utilisateur existant
    const index = users.value.findIndex(u => u.id === editingUser.value?.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...data }
    }
  } else {
    // Création d'un nouvel utilisateur
    const newUser: User = {
      id: Date.now().toString(), // Génération d'un ID temporaire
      nom: data.nom || '',
      prenom: data.prenom || '',
      email: data.email || '',
      telephone: data.telephone || '',
      role: data.role || 'CLIENT',
      statut: data.statut || 'EN_ATTENTE_VALIDATION'
    }
    users.value.push(newUser)
  }
  
  closeModal()
  console.log('Utilisateur sauvegardé:', data)
}

function handleFormReset() {
  console.log('Formulaire réinitialisé')
}

function viewUser(user: User) {
  console.log('Voir utilisateur:', user)
  // TODO: Navigation vers la page de détail
}

function deleteUser(user: User) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.prenom} ${user.nom} ?`)) {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
  }
}
</script> 