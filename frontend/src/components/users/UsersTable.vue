<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilisateur
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rôle
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date de création
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dernière connexion
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <!-- Utilisateur -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ user.prenom.charAt(0) }}{{ user.nom.charAt(0) }}
                  </span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.prenom }} {{ user.nom }}
                  </div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                  <div v-if="user.telephone" class="text-sm text-gray-400">
                    <i class="fas fa-phone mr-1"></i>{{ user.telephone }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Rôle -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getRoleClass(user.role)"
              >
                <i :class="getRoleIcon(user.role)" class="mr-1"></i>
                {{ getRoleLabel(user.role) }}
              </span>
            </td>

            <!-- Statut -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusClass(user.statut)"
              >
                <i :class="getStatusIcon(user.statut)" class="mr-1"></i>
                {{ getStatusLabel(user.statut) }}
              </span>
            </td>

            <!-- Date de création -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.createdAt) }}
            </td>

            <!-- Dernière connexion -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span v-if="user.dateDerniereConnexion">
                {{ formatDate(user.dateDerniereConnexion) }}
              </span>
              <span v-else class="text-gray-400">
                Jamais connecté
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end space-x-2">
                <!-- Voir détails -->
                <button
                  @click="openDetailModal(user)"
                  class="text-blue-600 hover:text-blue-900 p-1"
                  title="Voir les détails"
                >
                  <i class="fas fa-eye"></i>
                </button>

                <!-- Modifier -->
                <button
                  @click="$emit('edit-user', user)"
                  class="text-green-600 hover:text-green-900 p-1"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>

                <!-- Renvoyer invitation -->
                <button
                  v-if="user.statut === 'INACTIF'"
                  @click="handleResendInvitation(user)"
                  :disabled="resendingInvitation === user.id"
                  class="text-orange-600 hover:text-orange-900 p-1 disabled:opacity-50"
                  title="Renvoyer l'invitation"
                >
                  <i v-if="resendingInvitation === user.id" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-envelope"></i>
                </button>

                <!-- Changer statut -->
                <div class="relative">
                  <button
                    @click="toggleStatusMenu(user.id)"
                    class="text-gray-600 hover:text-gray-900 p-1"
                    title="Changer le statut"
                  >
                    <i class="fas fa-toggle-on"></i>
                  </button>
                  
                  <!-- Menu statut -->
                  <div 
                    v-if="openStatusMenu === user.id"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                  >
                    <button
                      v-for="status in availableStatuses"
                      :key="status.value"
                      @click="handleStatusChange(user, status.value)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      :class="{ 'bg-blue-50 text-blue-700': user.statut === status.value }"
                    >
                      <i :class="status.icon" class="mr-2"></i>
                      {{ status.label }}
                    </button>
                  </div>
                </div>

                <!-- Supprimer -->
                <button
                  @click="handleDeleteUser(user)"
                  class="text-red-600 hover:text-red-900 p-1"
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

    <!-- Empty state -->
    <div v-if="users.length === 0 && !loading" class="text-center py-12">
      <i class="fas fa-users text-4xl text-gray-300 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
      <p class="text-gray-500">Commencez par créer votre premier utilisateur.</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
      <p class="text-gray-500">Chargement des utilisateurs...</p>
    </div>
  </div>
  <UserDetailModal
    v-if="showDetailModal && selectedUser"
    :isOpen="showDetailModal"
    :user="selectedUser"
    @close="closeDetailModal"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user.store'
import type { User, UserRole, UserStatus } from '@/types/user.types'
import UserDetailModal from './UserDetailModal.vue'

interface Props {
  users: User[]
  loading?: boolean
}

interface Emits {
  (e: 'view-user', user: User): void
  (e: 'edit-user', user: User): void
  (e: 'user-deleted', user: User): void
  (e: 'user-status-changed', user: User): void
  (e: 'invitation-sent', user: User): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()
const openStatusMenu = ref<number | null>(null)
const resendingInvitation = ref<number | null>(null)
const showDetailModal = ref(false)
const selectedUser = ref<User | null>(null)

// Status options
const availableStatuses = [
  { value: 'ACTIF', label: 'Actif', icon: 'fas fa-check-circle text-green-600' },
  { value: 'INACTIF', label: 'Inactif', icon: 'fas fa-clock text-yellow-600' },
  { value: 'SUSPENDU', label: 'Suspendu', icon: 'fas fa-ban text-red-600' }
]

// Utility functions
const getRoleClass = (role: UserRole) => {
  const classes = {
    ADMIN: 'bg-purple-100 text-purple-800',
    CLIENT: 'bg-blue-100 text-blue-800',
    TECHNICIEN: 'bg-orange-100 text-orange-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const getRoleIcon = (role: UserRole) => {
  const icons = {
    ADMIN: 'fas fa-crown',
    CLIENT: 'fas fa-user',
    TECHNICIEN: 'fas fa-tools'
  }
  return icons[role] || 'fas fa-user'
}

const getRoleLabel = (role: UserRole) => {
  const labels = {
    ADMIN: 'Administrateur',
    CLIENT: 'Client',
    TECHNICIEN: 'Technicien'
  }
  return labels[role] || role
}

const getStatusClass = (status: UserStatus) => {
  const classes = {
    ACTIF: 'bg-green-100 text-green-800',
    INACTIF: 'bg-yellow-100 text-yellow-800',
    SUSPENDU: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusIcon = (status: UserStatus) => {
  const icons = {
    ACTIF: 'fas fa-check-circle',
    INACTIF: 'fas fa-clock',
    SUSPENDU: 'fas fa-ban'
  }
  return icons[status] || 'fas fa-question-circle'
}

const getStatusLabel = (status: UserStatus) => {
  const labels = {
    ACTIF: 'Actif',
    INACTIF: 'Inactif',
    SUSPENDU: 'Suspendu'
  }
  return labels[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Event handlers
const toggleStatusMenu = (userId: number) => {
  openStatusMenu.value = openStatusMenu.value === userId ? null : userId
}

const handleStatusChange = async (user: User, newStatus: string) => {
  try {
    await userStore.updateUserStatus(user.id, newStatus as UserStatus)
    emit('user-status-changed', user)
    openStatusMenu.value = null
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
  }
}

const handleDeleteUser = async (user: User) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.prenom} ${user.nom} ?`)) {
    try {
      await userStore.deleteUser(user.id)
      emit('user-deleted', user)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const handleResendInvitation = async (user: User) => {
  try {
    resendingInvitation.value = user.id
    await userStore.resendInvitation(user.id)
    emit('invitation-sent', user)
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'invitation:', error)
  } finally {
    resendingInvitation.value = null
  }
}

// Close status menu when clicking outside
const closeStatusMenu = () => {
  openStatusMenu.value = null
}

// Add click outside listener
document.addEventListener('click', closeStatusMenu)

function openDetailModal(user: User) {
  selectedUser.value = user
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedUser.value = null
}
</script> 