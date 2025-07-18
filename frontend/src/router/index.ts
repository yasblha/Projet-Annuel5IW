import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import DashboardLayout from '@/views/dashboard/DashboardLayout.vue'
import ListClientsView from '@/views/clients/ListClientsView.vue'
import ContratsView from '@/views/dashboard/ContratsView.vue'
import AnalyticsView from '@/views/dashboard/AnalyticsView.vue'
import CreateContractWizard from '@/views/contracts/CreateContractWizard.vue'
import ContractSignaturePage from '@/views/contracts/ContractSignaturePage.vue'
import UsersAdminView from '@/views/admin/UsersAdminView.vue'
import RolesView from '@/views/admin/RolesView.vue'
import PagesHabilitationView from '@/views/admin/PagesHabilitationView.vue'
import TarifsAutoUpdateView from '@/views/admin/TarifsAutoUpdateView.vue'
import CaissesView from '@/views/admin/CaissesView.vue'
import { useAuthStore } from '@/stores/auth.store.ts';
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue';
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue';
import ActivateView from '@/views/auth/ActivateView.vue';
import UsersView from '@/views/UsersView.vue';
import ProfileView from '@/views/auth/ProfileView.vue';
import HomeHubView from '@/views/HomeHubView.vue';
import ClientDetailView from '@/views/clients/ClientDetailView.vue';
import ClientDetailsView from '@/views/clients/ClientDetailsView.vue';
import AccessDeniedView from '@/views/errors/AccessDeniedView.vue';
import ContractDetailsView from '@/views/contracts/ContractDetailsView.vue';
import CompteurListView from '@/views/dashboard/CompteurListView.vue';
import CompteurDetailView from '@/views/dashboard/CompteurDetailView.vue';
// Import des pages légales
import CguView from '@/views/legal/CguView.vue';
import PrivacyView from '@/views/legal/PrivacyView.vue';
import ContactView from '@/views/legal/ContactView.vue';
import { setupAuthGuards } from './guards';

// Import des composants factures pour éviter les erreurs d'importation dynamique
import FactureListView from '@/views/factures/FactureListView.vue'
import FactureDetailView from '@/views/factures/FactureDetailView.vue'

// Import des vues de contrats v2
import ContractsListViewV2 from '@/views/contracts/v2/ContractsListView.vue';
import ContractDetailsViewV2 from '@/views/contracts/v2/ContractDetailsView.vue';
import CreateContractViewV2 from '@/views/contracts/v2/CreateContractView.vue';
import TemplatesViewV2 from '@/views/contracts/v2/TemplatesView.vue';

// Import des vues de debug
import ContractV2DebugView from '@/views/debug/ContractV2DebugView.vue';

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    // Routes pour les pages légales
    {
      path: '/cgu',
      name: 'cgu',
      component: CguView
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyView
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView
    },
    {
      path: '/activate',
      name: 'activate',
      component: ActivateView
    },
    {
      path: '/confirm/:token',
      name: 'confirm',
      component: ActivateView
    },
    {
      path: '/access-denied',
      name: 'access-denied',
      component: AccessDeniedView
    },
    {
      path: '/hub',
      name: 'hub',
      component: HomeHubView,
      meta: { 
        requiresAuth: true,
        permission: { module: 'dashboard', action: 'view' }
      }
    },
    {
      path: '/home-hub',
      name: 'home-hub',
      component: HomeHubView,
      meta: {
        requiresAuth: true,
        permission: { module: 'dashboard', action: 'view' }
      }
    },
    {
      path: '/clients',
      name: 'clients',
      component: ListClientsView,
      meta: { 
        requiresAuth: true,
        permission: { module: 'clients', action: 'view' }
      }
    },
    {
      path: '/clients/:id',
      name: 'client-detail',
      component: ClientDetailView,
      meta: { 
        requiresAuth: true,
        permission: { module: 'clients', action: 'view' }
      }
    },
    {
      path: '/clients/:id/details',
      name: 'client-details',
      component: ClientDetailsView,
      meta: { 
        requiresAuth: true,
        permission: { module: 'clients', action: 'view' }
      }
    },
    // Ajout des routes manquantes
    {
      path: '/invoices',
      name: 'invoices',
      // Utilisation d'un import dynamique pour la gestion lazy-loading
      component: () => import('@/views/dashboard/InvoicesView.vue'),
      meta: {
        requiresAuth: true,
        permission: { module: 'invoices', action: 'view' }
      }
    },
    {
      path: '/payments',
      name: 'payments',
      component: () => import('@/views/dashboard/PaymentsView.vue'),
      meta: {
        requiresAuth: true,
        permission: { module: 'payments', action: 'view' }
      }
    },
    {
      path: '/maintenance',
      name: 'maintenance',
      component: () => import('@/views/dashboard/MaintenanceView.vue'),
      meta: {
        requiresAuth: true,
        permission: { module: 'maintenance', action: 'view' }
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/dashboard/SettingsView.vue'),
      meta: {
        requiresAuth: true,
        permission: { module: 'settings', action: 'view' }
      }
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: {
        requiresAuth: true
      },
      children: [
        { 
          path: '', 
          component: DashboardView,
          meta: {
            permission: { module: 'dashboard', action: 'view' }
          }
        },
        { 
          path: 'analytics',
          name: 'analytics',
          component: AnalyticsView,
          meta: {
            permission: { module: 'dashboard', action: 'view' }
          }
        },
        { 
          path: 'clients', 
          component: ListClientsView,
          meta: {
            permission: { module: 'clients', action: 'view' }
          }
        },
        { 
          path: 'clients/:id', 
          component: ClientDetailView,
          meta: {
            permission: { module: 'clients', action: 'view' }
          }
        },
        { 
          path: 'clients/:id/details', 
          component: ClientDetailsView,
          meta: {
            permission: { module: 'clients', action: 'view' }
          }
        },
        { 
          path: 'contrats', 
          component: ContratsView,
          meta: {
            permission: { module: 'contracts', action: 'view' }
          }
        },
        { 
          path: 'contrats/:id', 
          component: ContractDetailsView,
          name: 'dashboard-contract-detail',
          meta: {
            permission: { module: 'contracts', action: 'view' }
          }
        },
        { 
          path: 'contrats/v2',
          component: ContractsListViewV2,
          name: 'dashboard-contracts-v2-list',
          meta: {
            permission: { module: 'contracts', action: 'view' }
          },
          beforeEnter(to, from, next) {
            const authStore = useAuthStore();
            authStore.hasPermission('contracts', 'view') ? next() : next('/access-denied');
          }
        },
        { 
          path: 'contrats/v2/create',
          component: CreateContractViewV2,
          name: 'dashboard-contracts-v2-create',
          meta: {
            permission: { module: 'contracts', action: 'create' }
          },
          beforeEnter(to, from, next) {
            const authStore = useAuthStore();
            authStore.hasPermission('contracts', 'create') ? next() : next('/access-denied');
          }
        },
        { 
          path: 'contrats/v2/templates',
          component: TemplatesViewV2,
          name: 'dashboard-contracts-v2-templates',
          meta: {
            permission: { module: 'contracts', action: 'create' }
          },
          beforeEnter(to, from, next) {
            const authStore = useAuthStore();
            authStore.hasPermission('contracts', 'create') ? next() : next('/access-denied');
          }
        },
        { 
          path: 'contrats/v2/:id',
          component: ContractDetailsViewV2,
          name: 'dashboard-contracts-v2-detail',
          meta: {
            permission: { module: 'contracts', action: 'view' }
          },
          beforeEnter(to, from, next) {
            const authStore = useAuthStore();
            authStore.hasPermission('contracts', 'view') ? next() : next('/access-denied');
          }
        },
        { 
          path: 'compteurs', 
          component: CompteurListView,
          name: 'dashboard-compteurs',
          meta: {
            // Aucune permission spécifique requise
          }
        },
        { 
          path: 'compteurs/:id', 
          component: CompteurDetailView,
          name: 'dashboard-compteur-detail',
          meta: {
            permission: { module: 'meters', action: 'view' }
          }
        },
        {
          path: 'paiements',
          name: 'dashboard-paiements',
          component: () => import('@/views/dashboard/PaymentsView.vue'),
          meta: {
            permission: { module: 'payments', action: 'view' }
          }
        },
        {
          path: 'aide',
          name: 'dashboard-aide',
          component: () => import('@/views/dashboard/HelpView.vue'),
          meta: {
            permission: { module: 'help', action: 'view' }
          }
        },
        { 
          path: 'interventions', 
          component: () => import('@/views/dashboard/InterventionsView.vue'),
          meta: {
            permission: { module: 'interventions', action: 'view' }
          },
          children: [
            {
              path: 'new',
              name: 'intervention-create',
              component: () => import('@/views/dashboard/InterventionEditView.vue'),
              meta: {
                permission: { module: 'interventions', action: 'create' }
              }
            },
            {
              path: ':id',
              name: 'intervention-detail',
              component: () => import('@/views/dashboard/InterventionDetailView.vue'),
              meta: {
                permission: { module: 'interventions', action: 'view' }
              }
            },
            {
              path: ':id/edit',
              name: 'intervention-edit',
              component: () => import('@/views/dashboard/InterventionEditView.vue'),
              meta: {
                permission: { module: 'interventions', action: 'edit' }
              }
            },
            {
              path: ':id/finish',
              name: 'intervention-finish',
              component: () => import('@/views/dashboard/InterventionFinishView.vue'),
              meta: {
                permission: { module: 'interventions', action: 'edit' }
              }
            }
          ]
        },
        {
          path: 'factures',
          component: FactureListView,
          name: 'facture-list',
          meta: {
            permission: { module: 'billing', action: 'view' }
          }
        },
        {
          path: 'factures/:id',
          component: FactureDetailView,
          name: 'facture-detail',
          meta: {
            permission: { module: 'billing', action: 'view' }
          }
        },
      ]
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: {
        requiresAuth: true,
        permission: { module: 'admin', action: 'view' }
      },
      children: [
        {
          path: 'users',
          component: UsersAdminView,
          meta: {
            permission: { module: 'users', action: 'view' }
          }
        },
        {
          path: 'roles',
          component: RolesView,
          meta: {
            permission: { module: 'admin', action: 'manage_roles' }
          }
        },
        {
          path: 'habilitations',
          component: PagesHabilitationView,
          meta: {
            permission: { module: 'admin', action: 'manage_permissions' }
          }
        },
        {
          path: 'tarifs',
          component: TarifsAutoUpdateView,
          meta: {
            permission: { module: 'admin', action: 'manage_tarifs' }
          }
        },
        {
          path: 'caisses',
          component: CaissesView,
          meta: {
            permission: { module: 'admin', action: 'manage_caisses' }
          }
        }
      ]
    },
    {
      path: '/contracts',
      children: [
        {
          path: 'create',
          component: CreateContractWizard,
          meta: {
            requiresAuth: true,
            permission: { module: 'contracts', action: 'create' }
          }
        },
        {
          path: ':id/signature',
          component: ContractSignaturePage,
          meta: {
            requiresSignatureToken: true
          }
        }
      ]
    },
    {
      path: '/contracts/v2',
      children: [
        {
          path: '',
          component: ContractsListViewV2,
          name: 'contracts-v2-list',
          meta: {
            requiresAuth: true,
            permission: { module: 'contracts', action: 'view' }
          },
          beforeEnter: (to, from, next) => {
            // Rediriger vers la route dans le layout dashboard
            next({ path: '/dashboard/contrats/v2' });
          }
        },
        {
          path: 'create',
          component: CreateContractViewV2,
          name: 'contracts-v2-create',
          meta: {
            requiresAuth: true,
            permission: { module: 'contracts', action: 'create' }
          },
          beforeEnter: (to, from, next) => {
            // Rediriger vers la route dans le layout dashboard
            next({ path: '/dashboard/contrats/v2/create' });
          }
        },
        {
          path: 'templates',
          component: TemplatesViewV2,
          name: 'contracts-v2-templates',
          meta: {
            requiresAuth: true,
            permission: { module: 'contracts', action: 'create' }
          },
          beforeEnter: (to, from, next) => {
            // Rediriger vers la route dans le layout dashboard
            next({ path: '/dashboard/contrats/v2/templates' });
          }
        },
        {
          path: ':id',
          component: ContractDetailsViewV2,
          name: 'contracts-v2-detail',
          meta: {
            requiresAuth: true,
            permission: { module: 'contracts', action: 'view' }
          },
          beforeEnter: (to, from, next) => {
            // Rediriger vers la route dans le layout dashboard
            next({ path: `/dashboard/contrats/v2/${to.params.id}` });
          }
        }
      ]
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: {
        requiresAuth: true,
        permission: { module: 'users', action: 'view' }
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        requiresAuth: true
      }
    },
    // Routes de debug - accessibles uniquement aux administrateurs
    {
      path: '/debug',
      component: DashboardLayout,
      meta: {
        requiresAuth: true,
        permission: { module: 'admin', action: 'view' }
      },
      children: [
        {
          path: 'contract-v2',
          component: ContractV2DebugView,
          name: 'debug-contract-v2',
          meta: {
            requiresAuth: true,
            permission: { module: 'admin', action: 'view' }
          }
        }
      ]
    },
  ]
})

// Appliquer les gardes d'authentification et d'autorisation au routeur
setupAuthGuards(router);

export default router;