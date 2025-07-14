import type { Directive, DirectiveBinding } from 'vue';
import { useAuthorizationService } from '@/services/authorization.service';

interface PermissionValue {
  module: string;
  action: string;
}

export const vHasPermission: Directive = {
  beforeMount(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    const { value } = binding;
    const { hasPermission } = useAuthorizationService();
    
    if (!value || !hasPermission(value.module, value.action)) {
      el.style.display = 'none';
    }
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    const { value } = binding;
    const { hasPermission } = useAuthorizationService();
    
    if (!value || !hasPermission(value.module, value.action)) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
    }
  }
};

// Fonction d'aide pour enregistrer la directive
export function setupPermissionDirective(app: any) {
  app.directive('has-permission', vHasPermission);
}
