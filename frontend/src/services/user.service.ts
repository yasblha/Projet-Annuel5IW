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
  private readonly baseUrl = '/auth/v2/users'

  async getUsers(filters: UserFilters = {}): Promise<UsersListResponse> {
    const params = new URLSearchParams()
    
    if (filters.role) params.append('role', filters.role)
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`)
    return response.data
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    // S'assurer que les données sont envoyées dans le bon format attendu par Auth V2
    const response = await apiClient.post('/auth/v2/invite', userData)
    return response.data
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, userData)
    return response.data
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  async resendInvitation(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/resend-invitation`)
    return response.data
  }

  async updateUserStatus(id: string, status: string): Promise<User> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/status`, { status })
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