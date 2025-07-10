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
        <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path === '/dashboard' }">
          <i class="fas fa-chart-line"></i>
          <span>Accueil</span>
        </router-link>
      </div>
      <div>
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-2 pl-2 tracking-wider">Clients & Contrats</h3>
        <router-link to="/dashboard/clients" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/dashboard/clients') }">
          <i class="fas fa-users"></i>
          <span>Clients</span>
        </router-link>
        <router-link to="/dashboard/contrats" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/dashboard/contrats') }">
          <i class="fas fa-file-contract"></i>
          <span>Contrats</span>
        </router-link>
      </div>
      <div>
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-2 pl-2 tracking-wider">Facturation</h3>
        <router-link to="/invoices" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/invoices') }">
          <i class="fas fa-file-invoice-dollar"></i>
          <span>Factures</span>
        </router-link>
        <router-link to="/payments" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/payments') }">
          <i class="fas fa-credit-card"></i>
          <span>Paiements</span>
        </router-link>
      </div>
      <div>
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-2 pl-2 tracking-wider">Interventions</h3>
        <router-link to="/interventions" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/interventions') }">
          <i class="fas fa-tools"></i>
          <span>Interventions</span>
        </router-link>
        <router-link to="/maintenance" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/maintenance') }">
          <i class="fas fa-wrench"></i>
          <span>Maintenance</span>
        </router-link>
      </div>
      <div v-if="authStore.isAdmin">
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-2 pl-2 tracking-wider">Administration</h3>
        <router-link to="/users" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/users') }">
          <i class="fas fa-user-shield"></i>
          <span>Utilisateurs</span>
        </router-link>
        <router-link to="/agencies" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/agencies') }">
          <i class="fas fa-building"></i>
          <span>Agences</span>
        </router-link>
        <router-link to="/reports" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/reports') }">
          <i class="fas fa-chart-bar"></i>
          <span>Rapports</span>
        </router-link>
      </div>
      <div>
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-2 pl-2 tracking-wider">Paramètres</h3>
        <router-link to="/profile" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/profile') }">
          <i class="fas fa-user"></i>
          <span>Profil</span>
        </router-link>
        <router-link to="/settings" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-50 transition" :class="{ 'bg-blue-100 text-blue-700 font-bold': $route.path.startsWith('/settings') }">
          <i class="fas fa-cog"></i>
          <span>Paramètres</span>
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
const router = useRouter()
const authStore = useAuthStore()
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script> 