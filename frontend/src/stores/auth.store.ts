import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/api.service'
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
  AuthState,
  AuthActions,
  AuthGetters
} from '@/types/auth.types'
import { useNotificationStore } from '@/stores/notification.store'

export const useAuthStore = defineStore('auth', () => {
  // État réactif
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const notificationStore = useNotificationStore()

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isClient = computed(() => user.value?.role === 'CLIENT')
  const isTechnicien = computed(() => user.value?.role === 'TECHNICIEN')
  const userFullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.prenom} ${user.value.nom}`
  })

  // Actions
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      
      // Vérifier si la réponse est un succès
      if (response.data.success) {
        const { data } = response.data
        
        // Stockage des données d'authentification
        token.value = data.access_token
        user.value = data.user
        
        // Sauvegarde dans localStorage
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        // Gérer l'erreur de la réponse
        throw new Error(response.data.error || 'Erreur lors de la connexion')
      }
      
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Erreur lors de la connexion'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiClient.post<RegisterResponse>('/auth/register', userData)
      const { data } = response.data
      
      // Pour l'inscription, on peut soit connecter automatiquement l'utilisateur
      // soit rediriger vers la page de connexion
      // Ici, on stocke juste les données de l'utilisateur créé
      user.value = data
      
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'inscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = (): void => {
    // Nettoyage de l'état
    user.value = null
    token.value = null
    error.value = null
    
    // Nettoyage du localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  const checkAuth = (): void => {
    // Vérification de l'authentification au démarrage
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      } catch (err) {
        // Si les données sont corrompues, on les supprime
        logout()
      }
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  // Fonctions d'API supplémentaires
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh')
      const { data } = response.data
      
      token.value = data.access_token
      user.value = data.user
      
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
    } catch (err: any) {
      // Si le refresh échoue, on déconnecte l'utilisateur
      logout()
      notificationStore.error('Session expirée', 'Veuillez vous reconnecter pour des raisons de sécurité.')
      window.location.href = '/login'
      throw err
    }
  }

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiClient.put<{ data: User }>('/auth/profile', profileData)
      user.value = response.data.data
      
      // Mise à jour du localStorage
      localStorage.setItem('user', JSON.stringify(user.value))
      
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du profil'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (passwordData: { 
    currentPassword: string; 
    newPassword: string 
  }): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      await apiClient.post('/auth/change-password', passwordData)
      
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du changement de mot de passe'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Action pour la confirmation d'invitation
  const confirmInvitation = async (data: { token: string; password: string }): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      await apiClient.post('/auth/confirm', data)
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Erreur lors de la confirmation'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Action pour l'invitation d'utilisateur (admin)
  const inviteUser = async (userData: { email: string; prenom: string; nom: string; role: string }): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      await apiClient.post('/auth/invite', userData)
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Erreur lors de l\'invitation'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // changement de mot de passe oublié
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      await apiClient.post('/auth/forgot-password', { email })
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Erreur lors de la demande'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // update reset du password
  const resetPassword = async (data: { token: string; newPassword: string }): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      await apiClient.post('/auth/reset-password', data)
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Erreur lors de la réinitialisation'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Action pour l'activation d'email
  const activateEmail = async (activationToken: string, password: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      const response = await apiClient.post('/auth/activate', { token: activationToken, password })
      
      // Si l'activation réussit, on peut connecter automatiquement l'utilisateur
      if (response.data.success) {
        const { data } = response.data
        token.value = data.access_token
        user.value = data.user
        
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Erreur lors de l\'activation'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Initialisation au démarrage
  checkAuth()

  return {
    // État
    user,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isClient,
    isTechnicien,
    userFullName,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    clearError,
    
    // Fonctions d'API supplémentaires
    refreshToken,
    updateProfile,
    changePassword,
    confirmInvitation,
    inviteUser,
    forgotPassword,
    resetPassword,
    activateEmail
  }
}) 