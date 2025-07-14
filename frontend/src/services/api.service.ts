import apiClient from './http.interceptor'

export default apiClient 

export function getContratById(id: string) {
  return apiClient.get(`/contrats/${id}`)
}

export function postContrat(data: any) {
  return apiClient.post('/contrats', data)
} 