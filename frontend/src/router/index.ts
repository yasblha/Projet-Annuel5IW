import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import DashboardLayout from '@/views/dashboard/DashboardLayout.vue'
import ClientsView from '@/views/dashboard/ClientsView.vue'
import ContratsView from '@/views/dashboard/ContratsView.vue'
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


const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
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
      path: '/dashboard',
      component: DashboardLayout,
      children: [
        { path: '', component: DashboardView },
        { path: 'clients', component: ClientsView },
        { path: 'contrats', component: ContratsView },
      ]
    },
    {
      path: '/dashboard/clients',
      name: 'Clients',
      component: () => import('@/views/dashboard/ClientsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        { path: 'users', component: UsersAdminView },
        { path: 'roles', component: RolesView },
        { path: 'pages', component: PagesHabilitationView },
        { path: 'tarifs', component: TarifsAutoUpdateView },
        { path: 'caisses', component: CaissesView },
      ]
    },
    {

      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },
    {
      path: '/confirm/:token',
      name: 'confirm',
      component: () => import('@/views/auth/ConfirmView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true, requiresAdmin: true }

    }
  ]
})

// Navigation guard pour l'authentification

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 