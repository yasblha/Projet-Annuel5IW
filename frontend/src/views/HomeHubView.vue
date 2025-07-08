<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Bienvenue sur la plateforme</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <!-- Application -->
      <div @click="goToDashboard" class="hub-card">
        <i class="fas fa-th-large text-blue-600 text-5xl mb-4"></i>
        <div class="text-xl font-semibold">Application</div>
        <div class="text-gray-500 text-sm mt-2">Accéder à l’espace de gestion</div>
      </div>
      <!-- Admin/Paramétrage -->
      <div @click="goToAdmin" class="hub-card">
        <i class="fas fa-cogs text-green-600 text-5xl mb-4"></i>
        <div class="text-xl font-semibold">Admin/Paramétrage</div>
        <div class="text-gray-500 text-sm mt-2">Administration et configuration</div>
      </div>
      <!-- Support -->
      <div @click="showSupport" class="hub-card">
        <i class="fas fa-life-ring text-purple-600 text-5xl mb-4"></i>
        <div class="text-xl font-semibold">Support</div>
        <div class="text-gray-500 text-sm mt-2">Assistance et aide</div>
      </div>
      <!-- Manuel utilisateur -->
      <div @click="showManual" class="hub-card">
        <i class="fas fa-book text-yellow-500 text-5xl mb-4"></i>
        <div class="text-xl font-semibold">Manuel utilisateur</div>
        <div class="text-gray-500 text-sm mt-2">Documentation et guides</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notification.store'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToAdmin = () => {
  if (authStore.isAdmin) {
    router.push('/admin')
  } else {
    notificationStore.error('Accès refusé', 'Vous n’avez pas les droits pour accéder à la partie administration.')
  }
}

const showSupport = () => {
  notificationStore.info('Support', 'Fonctionnalité à venir ou contactez votre administrateur.')
}

const showManual = () => {
  notificationStore.info('Manuel utilisateur', 'La documentation sera bientôt disponible.')
}
</script>

<style scoped>
.hub-card {
  @apply flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-10 cursor-pointer transition hover:scale-105 hover:shadow-2xl min-w-[250px] min-h-[250px];
  border: 2px solid #e5e7eb;
}
</style> 