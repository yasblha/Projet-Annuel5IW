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
    return `${user.value.firstName} ${user.value.lastName}` // Mise à jour des noms de propriétés
  })

  // Actions
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiClient.post<AuthResponse>('/auth/v2/login', credentials)
      
      // Le format de réponse du service Auth V2
      const { token: accessToken, user: userData } = response.data
      
      // Stockage des données d'authentification
      token.value = accessToken
      user.value = userData
      
      // Stockage dans localStorage pour persistance
      localStorage.setItem('auth_token', accessToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      
      // Notification de succès
      notificationStore.success('Connexion réussie', `Bienvenue ${userData.firstName} ${userData.lastName}`)
      
    } catch (err: any) {
      // Gestion des erreurs
      error.value = err.response?.data?.message || err.message || 'Erreur lors de la connexion'
      notificationStore.error('Échec de connexion', error.value)
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiClient.post<RegisterResponse>('/auth/v2/register', userData)
      
      // Pour un enregistrement réussi, on notifie l'utilisateur
      notificationStore.success('Inscription réussie', 'Votre compte a été créé avec succès.')
      
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'inscription'
      notificationStore.error('Échec d\'inscription', error.value)
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
    localStorage.removeItem('auth_user')
    
    // Notification
    notificationStore.info('Déconnexion', 'Vous avez été déconnecté avec succès')
  }

  const checkAuth = (): void => {
    // Récupération des données du localStorage
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        
        // Configuration du header d'autorisation pour toutes les requêtes
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      } catch (err) {
        // En cas d'erreur, on nettoie tout
        logout()
      }
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  // Fonctions d'API supplémentaires
  const refreshToken = async (): Promise<any> => {
    try {
      console.log('[AuthStore] Tentative de rafraîchissement du token');
      
      // Récupérer l'utilisateur depuis localStorage
      const storedUser = localStorage.getItem('auth_user');
      if (!storedUser) {
        throw new Error('Aucun utilisateur trouvé dans localStorage');
      }
      
      const userData = JSON.parse(storedUser);
      
      // Utiliser le nouvel endpoint v2 pour rafraîchir le token
      const response = await apiClient.post('/auth/v2/refresh', { userId: userData.id });
      
      console.log('[AuthStore] Réponse du rafraîchissement:', response.data);
      
      // Gestion des deux formats possibles de réponse (token ou access_token)
      const newToken = response.data.token || response.data.access_token;
      const updatedUser = response.data.user;
      
      if (!newToken) {
        throw new Error('Token non trouvé dans la réponse');
      }
      
      if (!updatedUser) {
        throw new Error('Données utilisateur non trouvées dans la réponse');
      }
      
      // Vérifier le contenu du token
      try {
        const tokenParts = newToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('[AuthStore] Payload du nouveau token:', payload);
          
          // Vérifier si les claims essentiels sont présents
          if (!payload.sub || !payload.email || !payload.role || !payload.agencyId) {
            console.error('[AuthStore] ATTENTION: Token incomplet, claims manquants:', payload);
            
            // Si l'utilisateur a un rôle et agencyId mais pas dans le token, forcer une déconnexion
            if (updatedUser.role && !payload.role) {
              console.error('[AuthStore] Incohérence critique entre token et données utilisateur');
              logout();
              throw new Error('Token invalide: claims manquants');
            }
          }
        }
      } catch (e) {
        console.error('[AuthStore] Erreur lors de l\'analyse du token:', e);
      }
      
      // Mise à jour du token et de l'utilisateur dans localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      // Mise à jour du header d'autorisation pour toutes les futures requêtes
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Mise à jour de l'état du store
      token.value = newToken;
      user.value = updatedUser;
      
      console.log('[AuthStore] Token rafraîchi avec succès');
      
      return { token: newToken, user: updatedUser };
    } catch (error) {
      console.error('[AuthStore] Échec du rafraîchissement du token:', error);
      throw error;
    }
  }

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      isLoading.value = true
      
      if (!user.value?.id) throw new Error('Utilisateur non connecté')
      
      const response = await apiClient.put(`/auth/v2/users/${user.value.id}`, profileData)
      
      // Mise à jour des données utilisateur
      user.value = { ...user.value, ...response.data }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      
      notificationStore.success('Profil mis à jour', 'Vos informations ont été mises à jour avec succès')
    } catch (err: any) {
      notificationStore.error('Erreur', err.response?.data?.message || 'Erreur lors de la mise à jour du profil')
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
      
      if (!user.value?.id) throw new Error('Utilisateur non connecté')
      
      await apiClient.post('/auth/v2/change-password', {
        userId: user.value.id,
        ...passwordData
      })
      
      notificationStore.success('Mot de passe modifié', 'Votre mot de passe a été modifié avec succès')
    } catch (err: any) {
      notificationStore.error('Erreur', err.response?.data?.message || 'Erreur lors du changement de mot de passe')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Action pour la confirmation d'invitation
  const confirmInvitation = async (data: { token: string; password: string }): Promise<void> => {
    try {
      isLoading.value = true
      
      await apiClient.post('/auth/v2/activate', data)
      
      notificationStore.success('Compte activé', 'Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.')
    } catch (err: any) {
      notificationStore.error('Erreur', err.response?.data?.message || 'Erreur lors de l\'activation du compte')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Action pour l'invitation d'utilisateur (admin)
  const inviteUser = async (userData: { email: string; firstName: string; lastName: string; role: string }): Promise<void> => {
    try {
      isLoading.value = true
      
      await apiClient.post('/auth/v2/invite', userData)
      
      notificationStore.success('Invitation envoyée', `Une invitation a été envoyée à ${userData.email}`)
    } catch (err: any) {
      notificationStore.error('Erreur', err.response?.data?.message || 'Erreur lors de l\'envoi de l\'invitation')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // changement de mot de passe oublié
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      isLoading.value = true
      
      await apiClient.post('/auth/v2/forgot-password', { email })
      
      notificationStore.success('Email envoyé', 'Un email de réinitialisation a été envoyé à votre adresse')
    } catch (err: any) {
      notificationStore.error('Erreur', err.response?.data?.message || 'Erreur lors de la demande de réinitialisation')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // update reset du password
  const resetPassword = async (data: { token: string; password: string }): Promise<void> => {
    try {
      isLoading.value = true
      
      await apiClient.post('/auth/v2/reset-password', data)
      
      notificationStore.success('Mot de passe réinitialisé', 'Votre mot de passe a été réinitialisé avec succès')
    } catch (err: any) {
      notificationStore.error('Erreur', err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Action pour l'activation d'email
  const activateEmail = async (token: string, password: string): Promise<void> => {
    try {
      isLoading.value = true
      
      const response = await apiClient.post('/auth/v2/activate', { token, password })
      
      // Si l'activation inclut une connexion automatique
      if (response.data.access_token) {
        token.value = response.data.access_token
        user.value = response.data.user
        
        localStorage.setItem('auth_token', response.data.access_token)
        localStorage.setItem('auth_user', JSON.stringify(response.data.user))
        
        // Configuration du header d'autorisation
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`
      }
      
      notificationStore.success('Compte activé', 'Votre compte a été activé avec succès')
    } catch (err: any) {
      notificationStore.error('Erreur', err.response?.data?.message || 'Erreur lors de l\'activation du compte')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Vérification des permissions utilisateur
  const hasPermission = (module: string, action: string): boolean => {
    // Si l'utilisateur est ADMIN, il a toutes les permissions
    if (user.value?.role === 'ADMIN') {
      return true;
    }
    
    // Vérification basée sur le rôle et le module/action
    // Cette implémentation peut être étendue selon les besoins spécifiques
    const permissions: Record<string, Record<string, string[]>> = {
      'MANAGER': {
        'contracts': ['view', 'create', 'edit', 'delete'],
        'clients': ['view', 'create', 'edit', 'delete'],
        'payments': ['view'],
        'invoices': ['view', 'create'],
        'meters': ['view'],
        'interventions': ['view', 'create', 'edit'],
        'help': ['view']
      },
      'TECHNICIEN': {
        'contracts': ['view'],
        'clients': ['view'],
        'interventions': ['view', 'create', 'edit'],
        'meters': ['view', 'create', 'edit'],
        'help': ['view']
      },
      'CLIENT': {
        'contracts': ['view'],
        'invoices': ['view'],
        'payments': ['view'],
        'help': ['view']
      }
    };
    
    const role = user.value?.role;
    if (!role || !permissions[role]) {
      return false;
    }
    
    return !!permissions[role][module]?.includes(action);
  };

  // Initialisation au démarrage
  checkAuth()

  return {
    // State
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
    refreshToken,
    updateProfile,
    changePassword,
    confirmInvitation,
    inviteUser,
    forgotPassword,
    resetPassword,
    activateEmail,
    hasPermission
  }
})