import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth.store.ts'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
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
    
    try {
      // Vérifier si le token est un JWT valide
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        console.warn('⚠️ Format de token invalide (pas un JWT standard)')
      } else {
        // Décoder le payload pour vérifier les informations
        const payload = JSON.parse(atob(tokenParts[1]))
        console.log('Token payload:', {
          sub: payload.sub,
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'non défini',
          iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'non défini'
        })
        
        // Vérifier si le token est expiré
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          console.warn('⚠️ Token expiré! Date d\'expiration:', new Date(payload.exp * 1000).toISOString())
        }
      }
    } catch (e) {
      console.error('Erreur lors de l\'analyse du token JWT:', e)
    }
    
    // S'assurer que les headers existent
    if (!config.headers) {
      config.headers = {} as any;
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
  
  // Forcer Content-Type pour POST, PUT, PATCH
  if (['post', 'put', 'patch'].includes((config.method || '').toLowerCase())) {
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';
  }

  // Afficher les headers pour vérifier
  console.log('En-têtes de requête:', config.headers)
  
  return config
}, error => {
  console.error('Erreur dans l\'intercepteur de requête:', error)
  return Promise.reject(error)
})

// Intercepteur de réponse pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Récupérer la requête originale pour pouvoir la réessayer
    const originalRequest = error.config;
    
    // Éviter les boucles infinies de tentatives
    if (originalRequest._retry) {
      console.log('Requête déjà réessayée, pas de nouvelle tentative');
      return Promise.reject(error);
    }
    
    // Gérer les erreurs 401 (non autorisé)
    if (error.response && error.response.status === 401) {
      console.log('Erreur 401 détectée, tentative de rafraîchissement du token');
      
      // Marquer la requête comme ayant été réessayée
      originalRequest._retry = true;
      
      try {
        // Utiliser le store Pinia pour rafraîchir le token
        const authStore = useAuthStore();
        const result = await authStore.refreshToken();
        
        if (result && result.token) {
          console.log('Token rafraîchi avec succès, nouvelle tentative de la requête originale');
          
          // Mettre à jour le header d'autorisation avec le nouveau token
          originalRequest.headers['Authorization'] = `Bearer ${result.token}`;
          
          // Attendre un court instant pour s'assurer que le token est bien propagé
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Réessayer la requête originale avec le nouveau token
          return api(originalRequest);
        } else {
          console.error('Échec du rafraîchissement du token');
          authStore.logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement du token:', refreshError);
        
        // En cas d'échec du rafraîchissement, déconnecter l'utilisateur
        const authStore = useAuthStore();
        authStore.logout();
        
        return Promise.reject(error);
      }
    }
    
    // Gérer les erreurs 500 (erreur serveur)
    if (error.response && error.response.status === 500) {
      console.log('Erreur 500 détectée:', error.response.data);
      
      // Vérifier si c'est une requête clients/v2 qui échoue
      if (originalRequest.url && originalRequest.url.includes('/clients/v2')) {
        console.log('Erreur 500 sur endpoint clients/v2');
        
        // Vérifier si la requête a déjà été réessayée
        if (originalRequest._retry500) {
          console.log('Requête déjà réessayée après erreur 500, pas de nouvelle tentative');
          return Promise.reject(error);
        }
        
        // Marquer la requête comme ayant été réessayée après une erreur 500
        originalRequest._retry500 = true;
        
        // Vérifier le token actuel
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('Token payload lors de l\'erreur 500:', payload);
              
              // Vérifier si le token est expiré
              let isExpired = false;
              if (payload.exp) {
                let expDate;
                
                // Si exp est un timestamp (nombre), le convertir en Date
                if (typeof payload.exp === 'number') {
                  expDate = new Date(payload.exp * 1000); // Convertir secondes en millisecondes
                } 
                // Si exp est une chaîne ISO, la parser directement
                else if (typeof payload.exp === 'string') {
                  expDate = new Date(payload.exp);
                }
                
                const now = new Date();
                console.log(`Date d'expiration du token: ${expDate}, Date actuelle: ${now}`);
                
                if (expDate && expDate < now) {
                  isExpired = true;
                  console.log('Token expiré détecté lors d\'une erreur 500');
                }
              }
              
              // Si le token est incomplet ou expiré, tenter un rafraîchissement
              if (isExpired || !payload.role || !payload.agencyId || !payload.email) {
                console.log('Token incomplet ou expiré détecté, tentative de rafraîchissement');
                
                try {
                  // Utiliser le store Pinia pour rafraîchir le token
                  const authStore = useAuthStore();
                  const result = await authStore.refreshToken();
                  
                  if (result && result.token) {
                    console.log('Token rafraîchi après erreur 500, nouvelle tentative de la requête originale');
                    
                    // Mettre à jour le header d'autorisation avec le nouveau token
                    originalRequest.headers['Authorization'] = `Bearer ${result.token}`;
                    
                    // Attendre un court instant pour s'assurer que le token est bien propagé
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Réessayer la requête originale avec le nouveau token
                    return api(originalRequest);
                  }
                } catch (refreshError) {
                  console.error('Erreur lors du rafraîchissement du token:', refreshError);
                }
              }
            }
          } catch (e) {
            console.error('Erreur lors de l\'analyse du token:', e);
          }
        }
      }
      
      // Vérifier si c'est une requête contrats/v2 qui échoue
      if (originalRequest.url && originalRequest.url.includes('/contrats/v2')) {
        console.log('Erreur 500 sur endpoint contrats/v2');
        
        // Vérifier si la requête a déjà été réessayée
        if (originalRequest._retry500) {
          console.log('Requête déjà réessayée après erreur 500, pas de nouvelle tentative');
          return Promise.reject(error);
        }
        
        // Marquer la requête comme ayant été réessayée après une erreur 500
        originalRequest._retry500 = true;
        
        // Vérifier le token actuel
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('Token payload lors de l\'erreur 500 sur contrats/v2:', payload);
              
              // Vérifier si le token est expiré
              let isExpired = false;
              if (payload.exp) {
                let expDate;
                
                // Si exp est un timestamp (nombre), le convertir en Date
                if (typeof payload.exp === 'number') {
                  expDate = new Date(payload.exp * 1000); // Convertir secondes en millisecondes
                } 
                // Si exp est une chaîne ISO, la parser directement
                else if (typeof payload.exp === 'string') {
                  expDate = new Date(payload.exp);
                }
                
                const now = new Date();
                console.log(`Date d'expiration du token: ${expDate}, Date actuelle: ${now}`);
                
                if (expDate && expDate < now) {
                  isExpired = true;
                  console.log('Token expiré détecté lors d\'une erreur 500');
                }
              }
              
              // Si le token est incomplet ou expiré, tenter un rafraîchissement
              if (isExpired || !payload.role || !payload.agencyId || !payload.email) {
                console.log('Token incomplet ou expiré détecté, tentative de rafraîchissement');
                
                try {
                  // Utiliser le store Pinia pour rafraîchir le token
                  const authStore = useAuthStore();
                  const result = await authStore.refreshToken();
                  
                  if (result && result.token) {
                    console.log('Token rafraîchi après erreur 500, nouvelle tentative de la requête originale');
                    
                    // Mettre à jour le header d'autorisation avec le nouveau token
                    originalRequest.headers['Authorization'] = `Bearer ${result.token}`;
                    
                    // Attendre un court instant pour s'assurer que le token est bien propagé
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Réessayer la requête originale avec le nouveau token
                    return api(originalRequest);
                  }
                } catch (refreshError) {
                  console.error('Erreur lors du rafraîchissement du token:', refreshError);
                }
              }
            }
          } catch (e) {
            console.error('Erreur lors de l\'analyse du token JWT:', e);
          }
        }
      }
    }
    
    // Pour toutes les autres erreurs, rejeter la promesse
    return Promise.reject(error);
  }
);

export default api