export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  role: UserRole
  statut: UserStatus
  dateCreation: string
  dateDerniereConnexion?: string
  activationToken?: string
  resetPasswordToken?: string
  createdAt: string
  updatedAt: string
}

export type UserRole = 'ADMIN' | 'CLIENT' | 'TECHNICIEN'
export type UserStatus = 'ACTIF' | 'INACTIF' | 'SUSPENDU'

export interface CreateUserRequest {
  nom: string
  prenom: string
  email: string
  telephone?: string
  role: UserRole
}

export interface CreateUserResponse {
  success: boolean
  message: string
  user?: User
}

export interface UsersListResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

export interface UserFilters {
  role?: UserRole
  statut?: UserStatus
  search?: string
  page?: number
  limit?: number
}

export interface UpdateUserRequest {
  nom?: string
  prenom?: string
  telephone?: string
  role?: UserRole
  statut?: UserStatus
}

export interface UserPermissions {
  canCreateUsers: boolean
  canUpdateUsers: boolean
  canDeleteUsers: boolean
  canViewUsers: boolean
  canAssignRoles: boolean
} 