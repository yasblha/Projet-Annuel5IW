import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth.store'

class HttpInterceptor {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Intercepteur pour les requêtes sortantes
    this.instance.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        if (authStore.token) {
          config.headers.Authorization = `Bearer ${authStore.token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Intercepteur pour les réponses entrantes
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        // Si l'erreur est 401 et qu'on n'a pas déjà tenté un refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          const authStore = useAuthStore()

          try {
            // Tentative de refresh du token
            if (authStore.user?.id) {
              await authStore.refreshToken()
              // Retry de la requête originale avec le nouveau token
              originalRequest.headers.Authorization = `Bearer ${authStore.token}`
              return this.instance(originalRequest)
            }
          } catch (refreshError) {
            // Si le refresh échoue, on déconnecte l'utilisateur
            authStore.logout()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        // Si l'erreur est 403, redirection vers la page d'accueil
        if (error.response?.status === 403) {
          console.error('Accès refusé')
          // Optionnel : redirection vers une page d'erreur 403
        }

        return Promise.reject(error)
      }
    )
  }

  public getInstance(): AxiosInstance {
    return this.instance
  }
}

// Instance singleton
const httpInterceptor = new HttpInterceptor()
export default httpInterceptor.getInstance() 