import apiClient from './api.service'
import type { 
  User, 
  CreateUserRequest, 
  CreateUserResponse, 
  UsersListResponse, 
  UserFilters, 
  UpdateUserRequest 
} from '@/types/user.types'

class UserService {
  private readonly baseUrl = '/users'

  async getUsers(filters: UserFilters = {}): Promise<UsersListResponse> {
    const params = new URLSearchParams()
    
    if (filters.role) params.append('role', filters.role)
    if (filters.statut) params.append('statut', filters.statut)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`)
    return response.data
  }

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await apiClient.post(`${this.baseUrl}`, userData)
    return response.data
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, userData)
    return response.data
  }

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  async resendInvitation(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/resend-invitation`)
    return response.data
  }

  async updateUserStatus(id: number, status: string): Promise<User> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/status`, { status })
    return response.data
  }

  async getUserStats(): Promise<{
    total: number
    actifs: number
    inactifs: number
    suspendus: number
    parRole: Record<string, number>
  }> {
    const response = await apiClient.get(`${this.baseUrl}/stats`)
    return response.data
  }
}

export const userService = new UserService() 