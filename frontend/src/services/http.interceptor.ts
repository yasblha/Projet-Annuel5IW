import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true
})

// Intercepteur pour ajouter automatiquement le token aux requêtes
api.interceptors.request.use(config => {
  console.log('Intercepteur de requête activé pour:', config.url)
  
  // Récupérer le token directement depuis localStorage
  const token = localStorage.getItem('auth_token')
  
  // Afficher les premiers caractères du token pour débogage
  if (token) {
    const tokenPreview = token.substring(0, 20) + '...'
    console.log(`Token trouvé (${token.length} caractères):`, tokenPreview)
    
    // S'assurer que les headers existent
    if (!config.headers) {
      config.headers = {}
    }
    
    // Ajouter le token aux headers
    config.headers.Authorization = `Bearer ${token}`
    console.log('En-tête Authorization ajouté à la requête')
  } else {
    console.warn('⚠️ Aucun token trouvé dans localStorage pour:', config.url)
    // Vérifier les autres clés possibles
    const allKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      allKeys.push(localStorage.key(i))
    }
    console.log('Clés disponibles dans localStorage:', allKeys)
  }
  
  // Afficher les headers pour vérifier
  console.log('En-têtes de requête:', config.headers)
  
  return config
}, error => {
  console.error('Erreur dans l\'intercepteur de requête:', error)
  return Promise.reject(error)
})

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  response => {
    console.log('Réponse reçue pour:', response.config.url, 'Status:', response.status)
    return response
  },
  error => {
    // Log détaillé des erreurs pour faciliter le débogage
    console.error('Erreur API interceptée:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      data: error.response?.data
    })

    // Ne pas rediriger automatiquement pour les erreurs CORS
    if (error.message && error.message.includes('Network Error')) {
      console.error('Erreur réseau possible - problème CORS:', error)
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      console.warn('Erreur 401 détectée - problème d\'authentification')

      const token = localStorage.getItem('auth_token')
      let tokenExpired = true

      if (token) {
        console.log('Token actuel qui a échoué:', token.substring(0, 20) + '...')
        
        try {
          const tokenParts = token.split('.')
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]))
            const expDate = new Date(payload.exp * 1000)
            tokenExpired = expDate.getTime() < Date.now()
            console.log('Date d\'expiration du token:', expDate)
            console.log('Token expiré ?', tokenExpired)
          }
        } catch (e) {
          console.error('Erreur lors du décodage du token:', e)
        }
      }

      // Déconnecter uniquement si le token est réellement expiré
      if (tokenExpired) {
        console.log('Token expiré - suppression et redirection vers login')
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          window.location.href = '/login'
        }
      } else {
        // Le token est encore valide : ne pas déconnecter, simplement rejeter l'erreur
        console.warn('401 reçu mais token encore valide - aucune déconnexion')
      }
    }
    return Promise.reject(error)
  }
)

export default api