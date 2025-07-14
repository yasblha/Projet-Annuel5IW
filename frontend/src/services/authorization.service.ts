import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import type { UserRole } from '@/types/auth.types';

interface Permission {
  module: string;
  action: string;
}

type PermissionMap = Record<UserRole, Permission[]>;

export const useAuthorizationService = () => {
  const authStore = useAuthStore();
  
  // Définition hiérarchique des rôles (du plus élevé au plus bas)
  const roleHierarchy: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'DIRECTEUR',
    'MANAGER',
    'COMMERCIAL',
    'COMPTABLE',
    'TECHNICIEN',
    'INTERVENANT_EXTERNE',
    'AUDITEUR',
    'CONSULTANT',
    'SUPPORT_CLIENT',
    'SUPPORT',
    'CLIENT'
  ];
  
  // Permissions par module/action pour chaque rôle
  const permissionMap: PermissionMap = {
    'SUPER_ADMIN': [{ module: '*', action: '*' }], // Accès complet
    'ADMIN': [
      { module: 'dashboard', action: '*' }, 
      { module: 'users', action: '*' },
      { module: 'clients', action: '*' },
      { module: 'contracts', action: '*' },
      { module: 'interventions', action: '*' },
      { module: 'billing', action: '*' },
      { module: 'reports', action: '*' },
      { module: 'settings', action: '*' },
      { module: 'admin', action: '*' }, 
      // Pas d'accès à certaines fonctionnalités SUPER_ADMIN comme la suppression de l'instance
    ],
    'DIRECTEUR': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'users', action: 'view' },
      { module: 'users', action: 'create' },
      { module: 'clients', action: '*' },
      { module: 'contracts', action: '*' },
      { module: 'interventions', action: '*' },
      { module: 'billing', action: 'view' },
      { module: 'billing', action: 'create' },
      { module: 'reports', action: '*' },
    ],
    'COMMERCIAL': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'clients', action: '*' },
      { module: 'contracts', action: 'view' },
      { module: 'contracts', action: 'create' },
      { module: 'contracts', action: 'edit' },
      { module: 'interventions', action: 'view' },
      { module: 'interventions', action: 'create' },
      { module: 'reports', action: 'view' },
    ],
    'COMPTABLE': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'clients', action: 'view' },
      { module: 'contracts', action: 'view' },
      { module: 'billing', action: '*' },
      { module: 'reports', action: 'view' },
      { module: 'reports', action: 'create' },
    ],
    'TECHNICIEN': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'interventions', action: '*' },
      { module: 'clients', action: 'view' },
      { module: 'contracts', action: 'view' },
    ],
    'INTERVENANT_EXTERNE': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'interventions', action: 'view' },
      { module: 'interventions', action: 'edit' },
      { module: 'clients', action: 'view' },
    ],
    'SUPPORT_CLIENT': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'clients', action: 'view' },
      { module: 'contracts', action: 'view' },
      { module: 'interventions', action: 'view' },
      { module: 'interventions', action: 'create' },
      { module: 'billing', action: 'view' },
    ],
    'MANAGER': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'users', action: 'view' },
      { module: 'clients', action: '*' },
      { module: 'contracts', action: 'view' },
      { module: 'contracts', action: 'approve' },
      { module: 'interventions', action: 'view' },
      { module: 'interventions', action: 'approve' },
      { module: 'reports', action: 'view' },
    ],
    'AUDITEUR': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'clients', action: 'view' },
      { module: 'contracts', action: 'view' },
      { module: 'interventions', action: 'view' },
      { module: 'billing', action: 'view' },
      { module: 'reports', action: 'view' },
      { module: 'reports', action: 'create' },
    ],
    'CONSULTANT': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'clients', action: 'view' },
      { module: 'contracts', action: 'view' },
      { module: 'interventions', action: 'view' },
      { module: 'reports', action: 'view' },
    ],
    'CLIENT': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'contracts', action: 'view' },
      { module: 'interventions', action: 'view' },
      { module: 'interventions', action: 'create' },
      { module: 'billing', action: 'view' },
    ],
    'SUPPORT': [
      { module: 'dashboard', action: 'view' }, 
      { module: 'clients', action: 'view' },
      { module: 'contracts', action: 'view' },
      { module: 'interventions', action: 'view' },
      { module: 'billing', action: 'view' },
    ]
  };
  
  // Obtenir le rôle actuel de l'utilisateur
  const userRole = computed<UserRole | null>(() => authStore.user?.role as UserRole || null);
  
  // Vérifier si un rôle est supérieur ou égal à un autre dans la hiérarchie
  const isRoleAtLeast = (minRole: UserRole, currentRole: UserRole | null): boolean => {
    if (!currentRole) return false;
    if (currentRole === minRole) return true;
    
    const minRoleIndex = roleHierarchy.indexOf(minRole);
    const currentRoleIndex = roleHierarchy.indexOf(currentRole);
    
    // Index plus petit = rôle plus élevé dans notre tableau
    return currentRoleIndex <= minRoleIndex; 
  };
  
  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (module: string, action: string): boolean => {
    const role = userRole.value;
    if (!role) return false;
    
    // Super admin a toutes les permissions
    if (role === 'SUPER_ADMIN') return true;
    
    const permissions = permissionMap[role] || [];
    
    // Vérifier les wildcards et permissions spécifiques
    return permissions.some(p => 
      (p.module === '*' && p.action === '*') || 
      (p.module === module && (p.action === '*' || p.action === action)) ||
      (p.module === '*' && p.action === action)
    );
  };
  
  // Vérifier si l'utilisateur a accès à un module entier
  const hasModuleAccess = (module: string): boolean => {
    return hasPermission(module, 'view');
  };
  
  return {
    userRole,
    isRoleAtLeast,
    hasPermission,
    hasModuleAccess,
    roleHierarchy
  };
};
