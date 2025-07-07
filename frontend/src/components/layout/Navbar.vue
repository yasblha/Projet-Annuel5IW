<template>
  <nav class="navbar bg-white shadow-sm border-b border-gray-200">
    <div class="flex items-center justify-between h-16 px-4">
      <!-- Left side -->
      <div class="flex items-center space-x-4">
        <!-- Mobile menu button -->
        <button 
          @click="toggleSidebar"
          class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <i class="fas fa-bars text-lg"></i>
        </button>

        <!-- Breadcrumb -->
        <div class="hidden md:flex items-center space-x-2 text-sm text-gray-600">
          <i class="fas fa-tint text-blue-600"></i>
          <span>/</span>
          <span class="font-medium text-gray-900">{{ currentPageTitle }}</span>
        </div>
      </div>

      <!-- Center - Search -->
      <div class="flex-1 max-w-lg mx-4 hidden md:block">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fas fa-search text-gray-400"></i>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <div class="relative">
          <button 
            @click="toggleNotifications"
            class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
          >
            <i class="fas fa-bell text-lg"></i>
            <!-- Notification badge -->
            <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ notificationCount > 9 ? '9+' : notificationCount }}
            </span>
          </button>

          <!-- Notifications dropdown -->
          <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
            <div class="px-4 py-2 border-b border-gray-200">
              <h3 class="text-sm font-medium text-gray-900">Notifications</h3>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <div v-if="notifications.length === 0" class="px-4 py-3 text-sm text-gray-500">
                Aucune notification
              </div>
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <i :class="notification.icon" class="text-lg text-gray-600"></i>
                  </div>
                  <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                    <p class="text-sm text-gray-500">{{ notification.message }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ notification.time }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-4 py-2 border-t border-gray-200">
              <button class="text-sm text-blue-600 hover:text-blue-800">
                Voir toutes les notifications
              </button>
            </div>
          </div>
        </div>

        <!-- User menu -->
        <div class="relative">
          <button 
            @click="toggleUserMenu"
            class="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ authStore.user?.prenom?.charAt(0) }}{{ authStore.user?.nom?.charAt(0) }}
              </span>
            </div>
            <div class="hidden md:block text-left">
              <div class="text-sm font-medium text-gray-900">
                {{ authStore.userFullName }}
              </div>
              <div class="text-xs text-gray-500">
                {{ authStore.user?.role }}
              </div>
            </div>
            <i class="fas fa-chevron-down text-sm"></i>
          </button>

          <!-- User dropdown -->
          <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <router-link 
              to="/profile" 
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <i class="fas fa-user mr-2"></i>
              Mon profil
            </router-link>
            <router-link 
              to="/settings" 
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <i class="fas fa-cog mr-2"></i>
              Paramètres
            </router-link>
            <div class="border-t border-gray-100"></div>
            <button 
              @click="handleLogout"
              class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <i class="fas fa-sign-out-alt mr-2"></i>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Reactive data
const searchQuery = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)
const notificationCount = ref(3)

// Computed
const currentPageTitle = computed(() => {
  const routeTitles: Record<string, string> = {
    '/dashboard': 'Tableau de bord',
    '/contracts': 'Contrats',
    '/subscriptions': 'Abonnements',
    '/invoices': 'Factures',
    '/payments': 'Paiements',
    '/interventions': 'Interventions',
    '/maintenance': 'Maintenance',
    '/users': 'Utilisateurs',
    '/agencies': 'Agences',
    '/reports': 'Rapports',
    '/profile': 'Profil',
    '/settings': 'Paramètres'
  }
  return routeTitles[route.path] || 'Page'
})

// Mock notifications
const notifications = ref([
  {
    id: 1,
    icon: 'fas fa-file-invoice-dollar text-blue-600',
    title: 'Nouvelle facture',
    message: 'Votre facture de décembre est disponible',
    time: 'Il y a 5 minutes'
  },
  {
    id: 2,
    icon: 'fas fa-tools text-orange-600',
    title: 'Intervention programmée',
    message: 'Maintenance prévue le 15 décembre',
    time: 'Il y a 1 heure'
  },
  {
    id: 3,
    icon: 'fas fa-check-circle text-green-600',
    title: 'Paiement confirmé',
    message: 'Votre paiement de novembre a été reçu',
    time: 'Il y a 2 heures'
  }
])

// Methods
const toggleSidebar = () => {
  // Émettre un événement pour toggle la sidebar sur mobile
  window.dispatchEvent(new CustomEvent('toggle-sidebar'))
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showNotifications.value = false
    showUserMenu.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 30;
}
</style> 