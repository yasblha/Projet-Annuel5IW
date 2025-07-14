import apiClient from '@/services/http.interceptor'
import type { CreateInterventionDto, FinishInterventionDto, Intervention, InterventionFilters, InterventionStatus } from '@/types/intervention.types'

export const interventionApi = {
  create: (data: CreateInterventionDto) => apiClient.post('/interventions', data),
  list: (params: InterventionFilters = {}): Promise<{ items: Intervention[], total: number }> => 
    apiClient.get('/interventions', { params }),
  getById: (id: string): Promise<Intervention> => apiClient.get(`/interventions/${id}`),
  finish: (id: string, data: FinishInterventionDto) => apiClient.patch(`/interventions/${id}/finish`, data),
  updateStatus: (id: string, status: InterventionStatus) => 
    apiClient.patch(`/interventions/${id}/status`, { status }),
  getByContract: (contractId: string, params = {}) => 
    apiClient.get('/interventions', { params: { contratId: contractId, ...params }}),
  cancel: (id: string, reason: string) =>
    apiClient.patch(`/interventions/${id}/cancel`, { reason })
}
