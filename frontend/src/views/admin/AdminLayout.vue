<template>
  <div class="flex min-h-screen">
    <!-- Admin Sidebar -->
    <aside class="h-screen w-72 bg-gray-900 text-white flex flex-col sticky top-0 z-40">
      <!-- Brand -->
      <div class="flex items-center gap-3 p-6 border-b border-gray-800">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-cogs text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-lg font-bold">Administration</h1>
          <p class="text-xs text-gray-400">Back-office</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-6 overflow-y-auto">
        <!-- Gestion -->
        <div>
          <h3 class="text-xs font-semibold uppercase text-gray-400 mb-2 pl-2 tracking-wider">Gestion</h3>
          <router-link
            to="/admin/users"
            class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            :class="{ 'bg-gray-800': $route.path.startsWith('/admin/users') }"
          >
            <i class="fas fa-user-shield"></i>
            <span>Utilisateurs</span>
          </router-link>
          <router-link
            to="/admin/roles"
            class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            :class="{ 'bg-gray-800': $route.path.startsWith('/admin/roles') }"
          >
            <i class="fas fa-id-card"></i>
            <span>Rôles</span>
          </router-link>
          <router-link
            to="/admin/pages"
            class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            :class="{ 'bg-gray-800': $route.path.startsWith('/admin/pages') }"
          >
            <i class="fas fa-lock"></i>
            <span>Pages & Habilitations</span>
          </router-link>
          <router-link
            to="/admin/agencies"
            class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            :class="{ 'bg-gray-800': $route.path.startsWith('/admin/agencies') }"
          >
            <i class="fas fa-building"></i>
            <span>Agences</span>
          </router-link>
        </div>

        <!-- Paramétrage -->
        <div>
          <h3 class="text-xs font-semibold uppercase text-gray-400 mb-2 pl-2 tracking-wider">Paramétrage</h3>
          <router-link
            to="/admin/tarifs"
            class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            :class="{ 'bg-gray-800': $route.path.startsWith('/admin/tarifs') }"
          >
            <i class="fas fa-tags"></i>
            <span>Tarifs</span>
          </router-link>
          <router-link
            to="/admin/caisses"
            class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            :class="{ 'bg-gray-800': $route.path.startsWith('/admin/caisses') }"
          >
            <i class="fas fa-cash-register"></i>
            <span>Caisses</span>
          </router-link>
        </div>

        <!-- Reporting -->
        <div>
          <h3 class="text-xs font-semibold uppercase text-gray-400 mb-2 pl-2 tracking-wider">Reporting</h3>
          <router-link
            to="/admin/reports"
            class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            :class="{ 'bg-gray-800': $route.path.startsWith('/admin/reports') }"
          >
            <i class="fas fa-chart-bar"></i>
            <span>Rapports</span>
          </router-link>
        </div>
      </nav>

      <!-- User & Logout -->
      <div class="p-4 border-t border-gray-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span class="text-white text-lg font-bold">
              {{ (authStore.user?.prenom?.charAt(0) || '') + (authStore.user?.nom?.charAt(0) || '') || '?' }}
            </span>
          </div>
          <div>
            <div class="text-sm font-medium">
              {{ (authStore.user?.prenom || '') + ' ' + (authStore.user?.nom || '') || 'Utilisateur' }}
            </div>
            <div class="text-xs text-gray-400">{{ authStore.user?.role || '' }}</div>
          </div>
        </div>
        <button @click="handleLogout" class="text-red-400 hover:text-red-600 text-sm flex items-center gap-1">
          <i class="fas fa-sign-out-alt"></i>
          <span>Quitter</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 bg-gray-50">
      <router-view />
    </main>
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