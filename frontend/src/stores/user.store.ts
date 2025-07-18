import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '@/services/user.service'
import type { 
  User, 
  CreateUserRequest, 
  UserFilters, 
  UpdateUserRequest,
  UserRole,
  UserStatus 
} from '@/types/user.types'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalUsers = ref(0)
  const currentPage = ref(1)
  const filters = ref<UserFilters>({
    page: 1,
    limit: 10
  })

  // Getters
  const getUsersByRole = computed(() => {
    return (role: UserRole) => users.value.filter(user => user.role === role)
  })

  const getUsersByStatus = computed(() => {
    return (status: UserStatus) => users.value.filter(user => user.status === status)
  })

  const getActiveUsers = computed(() => {
    return users.value.filter(user => user.status === 'ACTIF')
  })

  const getInactiveUsers = computed(() => {
    return users.value.filter(user => user.status === 'INACTIF')
  })

  const getSuspendedUsers = computed(() => {
    return users.value.filter(user => user.status === 'SUSPENDU')
  })

  // Actions
  const fetchUsers = async (newFilters?: UserFilters) => {
    try {
      loading.value = true
      error.value = null
      
      const finalFilters = { ...filters.value, ...newFilters }
      const response = await userService.getUsers(finalFilters)
      
      users.value = response.users
      totalUsers.value = response.total
      currentPage.value = response.page
      filters.value = finalFilters
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs'
      console.error('Erreur fetchUsers:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUserById = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const user = await userService.getUserById(id)
      currentUser.value = user
      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'utilisateur'
      console.error('Erreur fetchUserById:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData: CreateUserRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await userService.createUser(userData)
      
      // Si la réponse contient success explicitement à false, c'est une erreur
      if (response.success === false) {
        throw new Error(response.message || 'Erreur inconnue')
      }
      
      // Si on a un message et pas d'erreur explicite, c'est un succès
      // Recharger la liste des utilisateurs
      await fetchUsers()
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur'
      console.error('Erreur createUser:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: number, userData: UpdateUserRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const updatedUser = await userService.updateUser(id, userData)
      
      // Mettre à jour l'utilisateur dans la liste
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      // Mettre à jour currentUser si c'est le même
      if (currentUser.value?.id === id) {
        currentUser.value = updatedUser
      }
      
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'utilisateur'
      console.error('Erreur updateUser:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      await userService.deleteUser(id)
      
      // Retirer l'utilisateur de la liste
      users.value = users.value.filter(user => user.id !== id)
      totalUsers.value--
      
      // Vider currentUser si c'est le même
      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur'
      console.error('Erreur deleteUser:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const resendInvitation = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await userService.resendInvitation(id)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'invitation'
      console.error('Erreur resendInvitation:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUserStatus = async (id: number, status: UserStatus) => {
    try {
      loading.value = true
      error.value = null
      
      const updatedUser = await userService.updateUserStatus(id, status)
      
      // Mettre à jour l'utilisateur dans la liste
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      // Mettre à jour currentUser si c'est le même
      if (currentUser.value?.id === id) {
        currentUser.value = updatedUser
      }
      
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut'
      console.error('Erreur updateUserStatus:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    users.value = []
    currentUser.value = null
    loading.value = false
    error.value = null
    totalUsers.value = 0
    currentPage.value = 1
    filters.value = { page: 1, limit: 10 }
  }

  return {
    // State
    users,
    currentUser,
    loading,
    error,
    totalUsers,
    currentPage,
    filters,
    
    // Getters
    getUsersByRole,
    getUsersByStatus,
    getActiveUsers,
    getInactiveUsers,
    getSuspendedUsers,
    
    // Actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    resendInvitation,
    updateUserStatus,
    clearError,
    reset
  }
}) 