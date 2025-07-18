<template>
  <aside class="h-screen w-72 bg-white shadow-lg flex flex-col sticky top-0 z-40">
    <div class="flex items-center gap-3 p-6 border-b">
      <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
        <i class="fas fa-tint text-white text-xl"></i>
      </div>
      <div>
        <h1 class="text-lg font-bold text-gray-900">WaterApp</h1>
        <p class="text-xs text-gray-500">Gestion de l'eau</p>
      </div>
    </div>
    <nav class="flex-1 p-4 space-y-6 overflow-y-auto">
      <div>
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-2 pl-2 tracking-wider">Tableau de bord</h3>
        <router-link 
          v-if="hasPermission('dashboard', 'view')"
          to="/dashboard" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path === '/dashboard' }">
          <i class="fas fa-chart-line"></i>
          <span>Accueil</span>
        </router-link>
        <router-link 
          v-if="hasPermission('dashboard', 'view')"
          to="/dashboard/analytics" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path === '/dashboard/analytics' }">
          <i class="fas fa-chart-bar"></i>
          <span>Analytique</span>
        </router-link>
        <router-link 
          v-if="hasPermission('dashboard', 'view')"
          to="/hub" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path === '/hub' }">
          <i class="fas fa-th-large"></i>
          <span>Hub Central</span>
        </router-link>
      </div>
      <div>
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-2 pl-2 tracking-wider">Clients & Contrats</h3>
        <router-link 
          v-if="hasPermission('clients', 'view')"
          to="/dashboard/clients" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/dashboard/clients') }">
          <i class="fas fa-users"></i>
          <span>Clients</span>
        </router-link>
        <router-link 
          v-if="hasPermission('contracts', 'view')"
          to="/dashboard/contrats" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/dashboard/contrats') || $route.path.startsWith('/contracts/v2') }">
          <i class="fas fa-file-contract"></i>
          <span>Contrats</span>
          <span v-if="$route.path.startsWith('/contracts/v2')" class="ml-1 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Nouveau</span>
        </router-link>
        <router-link 
          v-if="hasPermission('contracts', 'create')"
          to="/dashboard/contrats/v2/templates" 
          class="flex items-center gap-3 px-4 py-2 ml-6 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/dashboard/contrats/v2/templates') }">
          <i class="fas fa-file-alt"></i>
          <span>Templates</span>
        </router-link>
      </div>
      <div>
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-2 pl-2 tracking-wider">Opérations</h3>
        <router-link 
          v-if="hasPermission('interventions', 'view')"
          to="/dashboard/interventions" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/dashboard/interventions') }">
          <i class="fas fa-tools"></i>
          <span>Interventions</span>
        </router-link>
        <router-link 
          to="/dashboard/compteurs" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/dashboard/compteurs') }">
          <i class="fas fa-tachometer-alt"></i>
          <span>Compteurs</span>
        </router-link>
        <router-link 
          v-if="hasPermission('billing', 'view')"
          to="/dashboard/factures" 
          class="flex items-center gap-3 p-2.5 text-sm rounded-lg text-gray-600 transition duration-150 ease-in-out hover:bg-blue-50 hover:text-blue-800"
          active-class="bg-blue-50 text-blue-800 font-semibold"
        >
          <i class="fas fa-file-invoice text-xl"></i>
          <span>Facturation</span>
        </router-link>
        <router-link 
          v-if="hasPermission('billing', 'manage')"
          to="/dashboard/paiements" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/dashboard/paiements') }">
          <i class="fas fa-money-check-alt"></i>
          <span>Paiements</span>
        </router-link>
      </div>
      <div v-if="hasPermission('admin', 'view')">
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-2 pl-2 tracking-wider">Administration</h3>
        <router-link 
          v-if="hasPermission('admin.users', 'view')"
          to="/admin/utilisateurs" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/admin/utilisateurs') }">
          <i class="fas fa-users-cog"></i>
          <span>Utilisateurs</span>
        </router-link>
        <router-link 
          v-if="hasPermission('admin.roles', 'view')"
          to="/admin/roles" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/admin/roles') }">
          <i class="fas fa-user-shield"></i>
          <span>Rôles & Permissions</span>
        </router-link>
        <router-link 
          v-if="hasPermission('admin.activity', 'view')"
          to="/admin/logs" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/admin/logs') }">
          <i class="fas fa-clipboard-list"></i>
          <span>Logs d'activité</span>
        </router-link>
      </div>
      <div>
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-2 pl-2 tracking-wider">Support</h3>
        <router-link 
          to="/aide" 
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" 
          :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path === '/aide' }">
          <i class="fas fa-question-circle"></i>
          <span>Aide</span>
        </router-link>
      </div>
    </nav>
    <div class="p-4 border-t flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white text-lg font-bold">
            {{ (authStore.user?.prenom?.charAt(0) || '') + (authStore.user?.nom?.charAt(0) || '') || '?' }}
          </span>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-900">
            {{ (authStore.user?.prenom || '') + ' ' + (authStore.user?.nom || '') || 'Utilisateur' }}
          </div>
          <div class="text-xs text-gray-500">{{ authStore.user?.role || '' }}</div>
        </div>
      </div>
      <button @click="handleLogout" class="text-red-600 hover:text-red-800 text-sm flex items-center gap-1">
        <i class="fas fa-sign-out-alt"></i>
        <span>Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useAuthorizationService } from '@/services/authorization.service'
import { computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const { hasPermission, isRoleAtLeast } = useAuthorizationService()

// Vérifier si l'utilisateur est administrateur
const isAdmin = computed(() => {
  return isRoleAtLeast('ADMIN', authStore.user?.role || null);
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>