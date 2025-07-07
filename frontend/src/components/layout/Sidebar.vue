<template>
  <div class="sidebar bg-white shadow-lg h-full">
    <!-- Logo et titre -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-tint text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">WaterApp</h1>
          <p class="text-xs text-gray-500">Gestion de l'eau</p>
        </div>
      </div>
    </div>

    <!-- Navigation principale -->
    <nav class="p-4 space-y-2">
      <!-- Dashboard -->
      <router-link 
        to="/dashboard" 
        class="nav-item"
        :class="{ 'active': $route.path === '/dashboard' }"
      >
        <i class="fas fa-chart-line icon"></i>
        <span>Tableau de bord</span>
      </router-link>

      <!-- Gestion des contrats -->
      <div class="nav-section">
        <h3 class="nav-section-title">Contrats & Abonnements</h3>
        <router-link 
          to="/contracts" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/contracts') }"
        >
          <i class="fas fa-file-contract icon"></i>
          <span>Contrats</span>
        </router-link>
        <router-link 
          to="/subscriptions" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/subscriptions') }"
        >
          <i class="fas fa-link icon"></i>
          <span>Abonnements</span>
        </router-link>
      </div>

      <!-- Facturation -->
      <div class="nav-section">
        <h3 class="nav-section-title">Facturation</h3>
        <router-link 
          to="/invoices" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/invoices') }"
        >
          <i class="fas fa-file-invoice-dollar icon"></i>
          <span>Factures</span>
        </router-link>
        <router-link 
          to="/payments" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/payments') }"
        >
          <i class="fas fa-credit-card icon"></i>
          <span>Paiements</span>
        </router-link>
      </div>

      <!-- Interventions -->
      <div class="nav-section">
        <h3 class="nav-section-title">Interventions</h3>
        <router-link 
          to="/interventions" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/interventions') }"
        >
          <i class="fas fa-tools icon"></i>
          <span>Interventions</span>
        </router-link>
        <router-link 
          to="/maintenance" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/maintenance') }"
        >
          <i class="fas fa-wrench icon"></i>
          <span>Maintenance</span>
        </router-link>
      </div>

      <!-- Administration (Admin seulement) -->
      <div v-if="authStore.isAdmin" class="nav-section">
        <h3 class="nav-section-title">Administration</h3>
        <router-link 
          to="/users" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/users') }"
        >
          <i class="fas fa-users icon"></i>
          <span>Utilisateurs</span>
        </router-link>
        <router-link 
          to="/agencies" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/agencies') }"
        >
          <i class="fas fa-building icon"></i>
          <span>Agences</span>
        </router-link>
        <router-link 
          to="/reports" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/reports') }"
        >
          <i class="fas fa-chart-bar icon"></i>
          <span>Rapports</span>
        </router-link>
      </div>

      <!-- Paramètres -->
      <div class="nav-section">
        <h3 class="nav-section-title">Paramètres</h3>
        <router-link 
          to="/profile" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/profile') }"
        >
          <i class="fas fa-user icon"></i>
          <span>Profil</span>
        </router-link>
        <router-link 
          to="/settings" 
          class="nav-item"
          :class="{ 'active': $route.path.startsWith('/settings') }"
        >
          <i class="fas fa-cog icon"></i>
          <span>Paramètres</span>
        </router-link>
      </div>
    </nav>

    <!-- Footer sidebar -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-500">
          {{ authStore.user?.role }}
        </div>
        <button 
          @click="handleLogout" 
          class="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  </div>
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

<style scoped>
.sidebar {
  width: 280px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 40;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: #374151;
  text-decoration: none;
  transition: all 0.2s;
  margin-bottom: 0.25rem;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.nav-item.active {
  background-color: #dbeafe;
  color: #1d4ed8;
  font-weight: 500;
}

.nav-item .icon {
  margin-right: 0.75rem;
  font-size: 1.125rem;
  width: 1.5rem;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
</style> 