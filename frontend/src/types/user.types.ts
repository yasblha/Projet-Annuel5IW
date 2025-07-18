export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  telephone?: string
  agencyId?: string
  status: UserStatus
  createdAt: string
  updatedAt: string
  passwordExpired?: boolean
  dateCreation: string
  dateDerniereConnexion?: string
  activationToken?: string
  resetPasswordToken?: string
}

export type UserRole = 'ADMIN' | 'CLIENT' | 'TECHNICIEN'
export type UserStatus = 'ACTIF' | 'INACTIF' | 'SUSPENDU'

export interface CreateUserRequest {
  firstName: string
  lastName: string
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
  status?: UserStatus
  search?: string
  page?: number
  limit?: number
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  telephone?: string
  role?: UserRole
  status?: UserStatus
}

export interface UserPermissions {
  canCreateUsers: boolean
  canUpdateUsers: boolean
  canDeleteUsers: boolean
  canViewUsers: boolean
  canAssignRoles: boolean
}