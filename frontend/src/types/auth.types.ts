// Types pour l'authentification
export interface User {
  id: string
  email: string
  nom: string
  prenom: string
  role: UserRole
  telephone?: string
  tenantId?: string
  statut?: UserStatus
  createdAt?: string
  updatedAt?: string
}

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'DIRECTEUR' 
  | 'COMMERCIAL' 
  | 'COMPTABLE' 
  | 'TECHNICIEN'
  | 'INTERVENANT_EXTERNE' 
  | 'SUPPORT_CLIENT' 
  | 'MANAGER' 
  | 'AUDITEUR' 
  | 'CONSULTANT' 
  | 'CLIENT' 
  | 'SUPPORT'

export type UserStatus = 'ACTIF' | 'INACTIF' | 'EN_ATTENTE_VALIDATION' | 'SUSPENDU'

// Types pour les requêtes d'authentification
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nom: string
  prenom: string
  email: string
  motDePasse: string
  telephone?: string
  role?: UserRole
  tenantId?: string
}

export interface ConfirmInvitationRequest {
  token: string;
  password: string;
}

export interface ActivateEmailRequest {
  token: string;
  password: string;
}

export interface InviteUserRequest {
  email: string;
  prenom: string;
  nom: string;
  role: string;
}

// Types pour les réponses d'authentification
export interface AuthResponse {
  success: boolean
  data: {
    access_token: string
    user: User
  }
  message?: string
  error?: string
}

export interface RegisterResponse {
  success: boolean
  data: User
  message?: string
}

// Types pour l'état du store
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Types pour les actions du store
export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  checkAuth: () => void
  clearError: () => void
}

// Types pour les getters du store
export interface AuthGetters {
  isAdmin: boolean
  isClient: boolean
  isTechnicien: boolean
  userFullName: string
} 