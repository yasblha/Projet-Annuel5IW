import apiClient from './http.interceptor'

export default apiClient 

export function getContratById(id: string) {
  return apiClient.get(`/contracts/${id}`)
}

export function postContrat(data: any) {
  return apiClient.post('/contracts', data)
} 