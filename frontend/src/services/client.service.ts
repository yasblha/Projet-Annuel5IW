import apiService from './api.service';
import type { 
  Client, 
  CreateClientRequest, 
  ListClientsRequest, 
  ListClientsResponse 
} from '@/types/client.types';
import { useAuthStore } from '@/stores/auth.store';
import router from '@/router';

class ClientService {
  private readonly baseUrl = '/clients/v2';
  private isRefreshing = false;

  // Vérifier si l'utilisateur est authentifié et a un token valide
  async checkAuthentication() {
    try {
      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('[ClientService] Aucun token trouvé');
        return false;
      }

      // Décoder le token pour vérifier les claims
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('[ClientService] Format de token invalide');
        return false;
      }

      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('[ClientService] Token payload:', payload);

        // Vérifier si le token est expiré
        if (payload.exp) {
          // Convertir correctement la date d'expiration
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
          console.log(`[ClientService] Date d'expiration du token: ${expDate}, Date actuelle: ${now}`);
          
          if (expDate && expDate < now) {
            console.error('[ClientService] Token expiré');
            
            // Éviter la récursion infinie en utilisant un flag
            if (!this.isRefreshing) {
              this.isRefreshing = true;
              try {
                await this.refreshTokenAndRetry();
                this.isRefreshing = false;
                
                // Ne pas rappeler checkAuthentication récursivement
                // Au lieu de cela, vérifier le nouveau token directement
                const newToken = localStorage.getItem('auth_token');
                if (!newToken) {
                  console.error('[ClientService] Pas de token après rafraîchissement');
                  return false;
                }
                
                return true;
              } catch (e) {
                this.isRefreshing = false;
                console.error('[ClientService] Échec du rafraîchissement:', e);
                return false;
              }
            } else {
              console.warn('[ClientService] Rafraîchissement déjà en cours, évitement de boucle');
              return false;
            }
          }
        }

        // Vérifier les claims essentiels
        if (!payload.sub) {
          console.error('[ClientService] Token invalide: ID utilisateur manquant');
          return false;
        }

        // Récupérer les informations utilisateur depuis localStorage comme fallback
        // si les claims ne sont pas dans le token
        if (!payload.role || !payload.agencyId) {
          console.warn('[ClientService] Token incomplet, tentative de récupération des données depuis localStorage');
          const storedUser = localStorage.getItem('auth_user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role && user.agencyId) {
              console.log('[ClientService] Données utilisateur récupérées depuis localStorage:', {
                role: user.role,
                agencyId: user.agencyId
              });
              
              // Vérifier les rôles autorisés
              const allowedRoles = ['ADMIN', 'MANAGER', 'TECHNICIEN'];
              if (!allowedRoles.includes(user.role)) {
                console.warn(`[ClientService] Rôle non autorisé: ${user.role}`);
                // On continue quand même, le backend fera la vérification finale
              }
              
              return true;
            }
          }
          
          console.error('[ClientService] Impossible de récupérer les données utilisateur');
          return false;
        }

        // Vérifier les rôles autorisés
        const allowedRoles = ['ADMIN', 'MANAGER', 'TECHNICIEN'];
        if (!allowedRoles.includes(payload.role)) {
          console.warn(`[ClientService] Rôle non autorisé: ${payload.role}`);
          // On continue quand même, le backend fera la vérification finale
        }

        // Vérifier que l'agence est présente
        if (!payload.agencyId) {
          console.error('[ClientService] Token invalide: ID d\'agence manquant');
          return false;
        }

        return true;
      } catch (error) {
        console.error('[ClientService] Erreur lors du décodage du token:', error);
        return false;
      }
    } catch (error) {
      console.error('[ClientService] Erreur lors de la vérification d\'authentification:', error);
      return false;
    }
  }
  
  // Méthode pour rafraîchir le token et réessayer
  private async refreshTokenAndRetry() {
    try {
      const authStore = useAuthStore();
      console.log('[ClientService] Tentative de rafraîchissement du token');
      await authStore.refreshToken();
      
      // Vérifier que le token a bien été mis à jour
      const newToken = localStorage.getItem('auth_token');
      if (!newToken) {
        console.error('[ClientService] Token non trouvé après rafraîchissement');
        await this.handleAuthError();
        throw new Error('Token non trouvé après rafraîchissement');
      }
      
      // Vérifier le format du token
      const tokenParts = newToken.split('.');
      if (tokenParts.length !== 3) {
        console.error('[ClientService] Format de token invalide après rafraîchissement');
        await this.handleAuthError();
        throw new Error('Format de token invalide après rafraîchissement');
      }
      
      try {
        // Vérifier que le payload est décodable
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('[ClientService] Nouveau token valide avec payload:', {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          agencyId: payload.agencyId
        });
      } catch (e) {
        console.error('[ClientService] Impossible de décoder le payload du nouveau token:', e);
        await this.handleAuthError();
        throw new Error('Token invalide après rafraîchissement');
      }
      
      // Attendre un court instant pour s'assurer que le token est bien propagé
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('[ClientService] Token rafraîchi avec succès');
      return true;
    } catch (error) {
      console.error('[ClientService] Échec du rafraîchissement du token:', error);
      await this.handleAuthError();
      throw new Error('Impossible de rafraîchir votre session, veuillez vous reconnecter');
    }
  }
  
  // Méthode pour gérer les erreurs d'authentification
  private async handleAuthError() {
    // Supprimer les informations d'authentification
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Rediriger vers la page de connexion
    if (router.currentRoute.value.path !== '/login') {
      console.warn('[ClientService] Redirection vers la page de connexion suite à une erreur d\'authentification');
      await router.push('/login');
    }
  }

  async list(params: ListClientsRequest = {}): Promise<ListClientsResponse> {
    try {
      // Vérifier l'authentification avant d'effectuer l'appel
      await this.checkAuthentication();
      
      // Convertir les paramètres en nombres si nécessaire
      const page = params.page ? Number(params.page) : 1;
      const limit = params.limit ? Number(params.limit) : 10;
      
      // Construire les paramètres de requête
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      if (params.type) {
        queryParams.append('type', params.type);
      }
      
      if (params.statut) {
        queryParams.append('statut', params.statut);
      }
      
      // Ajouter le token JWT pour que le backend puisse filtrer par agence
      queryParams.append('token', localStorage.getItem('auth_token') || '');
      
      console.log(`[ClientService] Fetching clients list with params: ${queryParams.toString()}`);
      
      const response = await apiService.get<any>(`${this.baseUrl}?${queryParams.toString()}`);
      console.log('[ClientService] Received clients list response:', response.data);
      
      // Le backend renvoie les clients dans "items" avec des métadonnées de pagination
      const { items, total, page: responsePage, limit: responseLimit } = response.data;
      
      // Adapter la réponse au format attendu par le frontend
      return {
        clients: items || [],
        total: total || 0,
        page: responsePage || page,
        limit: responseLimit || limit
      };
    } catch (error) {
      console.error('[ClientService] Error fetching clients list:', error);
      console.error('[ClientService] Error details:', error.response?.data || error.message);
      
      // Si l'erreur est liée à l'authentification (401 ou 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        try {
          await this.handleAuthError();
          
          // Réessayer après rafraîchissement du token
          return this.list(params);
        } catch (refreshError) {
          console.error('[ClientService] Failed to refresh token:', refreshError);
        }
      }
      
      // Pour les erreurs 500, vérifier si le token est expiré
      if (error.response?.status === 500) {
        try {
          const token = localStorage.getItem('auth_token');
          if (token) {
            // Vérifier si le token est expiré
            const isExpired = this.isTokenExpired(token);
            console.log('[ClientService] Token expired check:', isExpired);
            
            if (isExpired) {
              if (!this.isRefreshing) {
                this.isRefreshing = true;
                try {
                  console.log('[ClientService] Token expired, attempting refresh');
                  await this.authStore.refreshToken();
                  this.isRefreshing = false;
                  
                  // Réessayer après rafraîchissement du token
                  return this.list(params);
                } catch (refreshError) {
                  this.isRefreshing = false;
                  console.error('[ClientService] Failed to refresh token:', refreshError);
                }
              } else {
                console.log('[ClientService] Refresh already in progress, not attempting again');
              }
            }
          }
        } catch (e) {
          console.error('[ClientService] Error parsing token:', e);
        }
      }
      
      console.log('[ClientService] Returning empty list after failed refresh attempt');
      // Retourner une liste vide plutôt que de bloquer l'UI
      return { clients: [], total: 0, page: params.page || 1, limit: params.limit || 10 };
    }
  }

  async create(clientData: CreateClientRequest): Promise<Client> {
    try {
      // Vérifier l'authentification avant d'effectuer l'appel
      await this.checkAuthentication();
      
      console.log('[ClientService] Calling create with data:', { ...clientData, password: '***' });
      
      // Création d'une copie profonde des données pour éviter de modifier l'objet original
      const payload = JSON.parse(JSON.stringify(clientData));
      
      // Adapter le format pour correspondre au DTO du backend auth-service-v2
      const simplifiedPayload = {
        nom: payload.nom,
        prenom: payload.prenom,
        email: payload.email,
        telephone: payload.telephone || '',
        type: payload.type,
        statut: payload.statut || 'ACTIF',
        // Ajouter le token JWT pour que le backend puisse extraire l'agencyId
        token: localStorage.getItem('auth_token')
      };
      
      // Ajouter les champs d'adresse s'ils existent
      if (payload.adresseLigne1) {
        simplifiedPayload.adresseLigne1 = payload.adresseLigne1;
      }
      if (payload.adresseLigne2) {
        simplifiedPayload.adresseLigne2 = payload.adresseLigne2;
      }
      if (payload.codePostal) {
        simplifiedPayload.codePostal = payload.codePostal;
      }
      if (payload.ville) {
        simplifiedPayload.ville = payload.ville;
      }
      
      // Si on a encore l'ancien format d'adresse, extraire les champs
      if (payload.adresse) {
        if (!simplifiedPayload.adresseLigne1 && payload.adresse.ligne1) {
          simplifiedPayload.adresseLigne1 = payload.adresse.ligne1;
        }
        if (!simplifiedPayload.adresseLigne2 && payload.adresse.ligne2) {
          simplifiedPayload.adresseLigne2 = payload.adresse.ligne2;
        }
        if (!simplifiedPayload.codePostal && payload.adresse.codePostal) {
          simplifiedPayload.codePostal = payload.adresse.codePostal;
        }
        if (!simplifiedPayload.ville && payload.adresse.ville) {
          simplifiedPayload.ville = payload.adresse.ville;
        }
      }
    
      console.log('[ClientService] Sending simplified payload:', { ...simplifiedPayload, token: '***' });
      const response = await apiService.post<Client>(this.baseUrl, simplifiedPayload);
      console.log('[ClientService] Received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ClientService] Error in create method:', error);
      console.error('[ClientService] Error details:', error.response?.data || error.message);
      
      // Si l'erreur est liée à l'authentification (401 ou 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        await this.handleAuthError();
      }
      
      throw error;
    }
  }

  async getById(id: string): Promise<Client> {
    try {
      // Vérifier l'authentification avant d'effectuer l'appel
      await this.checkAuthentication();
      
      console.log(`[ClientService] Calling getById for client ID: ${id}`);
      const response = await apiService.get<Client>(`${this.baseUrl}/${id}`);
      console.log('[ClientService] Received client data:', response.data);
      return response.data;
    } catch (error) {
      console.error(`[ClientService] Error getting client with ID ${id}:`, error);
      console.error('[ClientService] Error details:', error.response?.data || error.message);
      
      // Si l'erreur est liée à l'authentification (401 ou 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        await this.handleAuthError();
      }
      
      throw error;
    }
  }

  async update(id: string, clientData: Partial<CreateClientRequest>): Promise<Client> {
    try {
      // Vérifier l'authentification avant d'effectuer l'appel
      await this.checkAuthentication();
      
      console.log(`[ClientService] Calling update for client ID: ${id}`, clientData);
      
      // Création d'une copie profonde des données pour éviter de modifier l'objet original
      const payload = JSON.parse(JSON.stringify(clientData));
      
      // Adapter le format pour correspondre au DTO du backend auth-service-v2
      const simplifiedPayload = {
        ...(payload.nom !== undefined && { nom: payload.nom }),
        ...(payload.prenom !== undefined && { prenom: payload.prenom }),
        ...(payload.email !== undefined && { email: payload.email }),
        ...(payload.telephone !== undefined && { telephone: payload.telephone }),
        ...(payload.type !== undefined && { type: payload.type }),
        ...(payload.statut !== undefined && { statut: payload.statut }),
        // Ajouter le token JWT pour que le backend puisse extraire l'agencyId
        token: localStorage.getItem('auth_token')
      };
      
      // Ajouter les champs d'adresse s'ils existent
      if (payload.adresseLigne1) {
        simplifiedPayload.adresseLigne1 = payload.adresseLigne1;
      }
      if (payload.adresseLigne2) {
        simplifiedPayload.adresseLigne2 = payload.adresseLigne2;
      }
      if (payload.codePostal) {
        simplifiedPayload.codePostal = payload.codePostal;
      }
      if (payload.ville) {
        simplifiedPayload.ville = payload.ville;
      }
      
      // Si on a encore l'ancien format d'adresse, extraire les champs
      if (payload.adresse) {
        if (!simplifiedPayload.adresseLigne1 && payload.adresse.ligne1) {
          simplifiedPayload.adresseLigne1 = payload.adresse.ligne1;
        }
        if (!simplifiedPayload.adresseLigne2 && payload.adresse.ligne2) {
          simplifiedPayload.adresseLigne2 = payload.adresse.ligne2;
        }
        if (!simplifiedPayload.codePostal && payload.adresse.codePostal) {
          simplifiedPayload.codePostal = payload.adresse.codePostal;
        }
        if (!simplifiedPayload.ville && payload.adresse.ville) {
          simplifiedPayload.ville = payload.adresse.ville;
        }
      }
      
      console.log('[ClientService] Sending simplified payload for update:', { ...simplifiedPayload, token: '***' });
      const response = await apiService.put<Client>(`${this.baseUrl}/${id}`, simplifiedPayload);
      console.log('[ClientService] Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`[ClientService] Error updating client ${id}:`, error);
      console.error('[ClientService] Error details:', error.response?.data || error.message);
      
      // Si l'erreur est liée à l'authentification (401 ou 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        await this.handleAuthError();
      }
      
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Vérifier l'authentification avant d'effectuer l'appel
      await this.checkAuthentication();
      
      console.log(`[ClientService] Calling delete for client ID: ${id}`);
      await apiService.delete(`${this.baseUrl}/${id}`);
      console.log('[ClientService] Client deleted successfully');
    } catch (error) {
      console.error(`[ClientService] Error deleting client with ID ${id}:`, error);
      console.error('[ClientService] Error details:', error.response?.data || error.message);
      
      // Si l'erreur est liée à l'authentification (401 ou 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        await this.handleAuthError();
      }
      
      throw error;
    }
  }
}

export const clientService = new ClientService();