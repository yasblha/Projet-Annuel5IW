// Types pour l'authentification
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  telephone?: string
  agencyId?: string
  status?: UserStatus
  createdAt?: string
  updatedAt?: string
  passwordExpired?: boolean
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
  firstName: string
  lastName: string
  email: string
  password: string
  telephone?: string
  role?: UserRole
  agencyName: string
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
  user: User
  token: string
  message?: string
}

export interface RegisterResponse {
  user: User
  token: string
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