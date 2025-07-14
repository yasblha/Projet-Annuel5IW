import { useAuthStore } from '@/stores/auth.store';
import { useAuthorizationService } from '@/services/authorization.service';
import { useNotificationStore } from '@/stores/notification.store';

interface PermissionMeta {
  module: string;
  action: string;
}

interface RouteMeta {
  requiresAuth?: boolean;
  permission?: PermissionMeta;
}

export function setupAuthGuards(router: any) {
  router.beforeEach(async (to: any, from: any, next: any) => {
    const authStore = useAuthStore();
    const { hasPermission } = useAuthorizationService();
    const notificationStore = useNotificationStore();
    
    // Si la route nécessite une authentification
    if (to.meta?.requiresAuth) {
      // Vérifier si l'utilisateur est connecté
      if (!authStore.isAuthenticated) {
        notificationStore.error(
          'Accès refusé',
          'Veuillez vous connecter pour accéder à cette page.'
        );
        
        // Rediriger vers la page de connexion avec le chemin de retour
        return next({
          path: '/login',
          query: { redirect: to.fullPath }
        });
      }
      
      // Si la route spécifie des permissions requises
      if (to.meta?.permission) {
        const { module, action } = to.meta.permission as PermissionMeta;
        
        if (!hasPermission(module, action)) {
          notificationStore.error(
            'Accès refusé',
            'Vous n\'avez pas les droits nécessaires pour accéder à cette page.'
          );
          
          // Rediriger vers une page d'accès refusé
          return next({ path: '/access-denied' });
        }
      }
    }
    
    // Continuer la navigation normalement
    return next();
  });
}
