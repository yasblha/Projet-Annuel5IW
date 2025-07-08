<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
    <div class="flex flex-wrap gap-4 mb-6">
      <div class="bg-white rounded shadow p-4 flex-1 min-w-[180px]">
        <div class="text-gray-500 text-xs">Total</div>
        <div class="text-2xl font-bold">{{ totalUsers }}</div>
      </div>
      <div class="bg-green-50 rounded shadow p-4 flex-1 min-w-[180px]">
        <div class="text-green-700 text-xs">Actifs</div>
        <div class="text-2xl font-bold text-green-700">{{ activeUsers }}</div>
      </div>
      <div class="bg-yellow-50 rounded shadow p-4 flex-1 min-w-[180px]">
        <div class="text-yellow-700 text-xs">En attente</div>
        <div class="text-2xl font-bold text-yellow-700">{{ pendingUsers }}</div>
      </div>
      <div class="bg-red-50 rounded shadow p-4 flex-1 min-w-[180px]">
        <div class="text-red-700 text-xs">Inactifs</div>
        <div class="text-2xl font-bold text-red-700">{{ inactiveUsers }}</div>
      </div>
    </div>
    <div class="flex items-center gap-4 mb-4">
      <input v-model="search" @input="handleSearch" type="text" placeholder="Rechercher par nom, email..." class="px-3 py-2 border rounded w-64" />
      <button @click="openCreateModal" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
        <i class="fas fa-user-plus mr-2"></i> Nouvel utilisateur
      </button>
    </div>
    <UsersTable :users="filteredUsers" :loading="loading" />
    <CreateUserModal :isOpen="showCreateModal" @close="closeCreateModal" @user-created="refreshUsers" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UsersTable from '@/components/users/UsersTable.vue'
import CreateUserModal from '@/components/users/CreateUserModal.vue'
import { useUserStore } from '@/stores/user.store'
import type { User } from '@/types/user.types'

const userStore = useUserStore()
const users = ref<User[]>([])
const loading = ref(false)
const search = ref('')
const showCreateModal = ref(false)

const totalUsers = computed(() => users.value.length)
const activeUsers = computed(() => users.value.filter(u => (u.statut as string) === 'ACTIF').length)
const pendingUsers = computed(() => users.value.filter(u => (u.statut as string) === 'EN_ATTENTE_VALIDATION').length)
const inactiveUsers = computed(() => users.value.filter(u => (u.statut as string) === 'INACTIF').length)

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const s = search.value.toLowerCase()
  return users.value.filter(u =>
    u.nom.toLowerCase().includes(s) ||
    u.prenom.toLowerCase().includes(s) ||
    u.email.toLowerCase().includes(s)
  )
})

function openCreateModal() {
  showCreateModal.value = true
}
function closeCreateModal() {
  showCreateModal.value = false
}
async function refreshUsers() {
  loading.value = true
  await userStore.fetchUsers()
  users.value = userStore.users
  loading.value = false
}
function handleSearch() {
  // Optionnel : debounce
}
onMounted(refreshUsers)
</script> 