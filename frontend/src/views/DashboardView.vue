<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <h1 class="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">
              Bienvenue, {{ authStore.userFullName }}
            </span>
            <Button @click="handleLogout" variant="outline">
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Carte utilisateur -->
          <Card class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Informations utilisateur
            </h3>
            <div class="space-y-2">
              <p><strong>Nom:</strong> {{ authStore.user?.nom }}</p>
              <p><strong>Prénom:</strong> {{ authStore.user?.prenom }}</p>
              <p><strong>Email:</strong> {{ authStore.user?.email }}</p>
              <p><strong>Rôle:</strong> {{ authStore.user?.role }}</p>
              <p v-if="authStore.user?.telephone">
                <strong>Téléphone:</strong> {{ authStore.user.telephone }}
              </p>
              <p v-if="authStore.user?.statut">
                <strong>Statut:</strong> {{ authStore.user.statut }}
              </p>
            </div>
          </Card>

          <!-- Carte permissions -->
          <Card class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Permissions
            </h3>
            <div class="space-y-2">
              <p v-if="authStore.isAdmin" class="text-green-600">
                ✅ Administrateur
              </p>
              <p v-if="authStore.isClient" class="text-blue-600">
                👤 Client
              </p>
              <p v-if="authStore.isTechnicien" class="text-orange-600">
                🔧 Technicien
              </p>
            </div>
          </Card>

          <!-- Carte actions rapides -->
          <Card class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div class="space-y-2">
              <Button 
                v-if="authStore.isAdmin" 
                variant="outline" 
                class="w-full justify-start"
                @click="navigateToUsers"
              >
                👥 Gérer les utilisateurs
              </Button>
              <Button 
                variant="outline" 
                class="w-full justify-start"
                @click="navigateToProfile"
              >
                👤 Modifier le profil
              </Button>
              <Button 
                variant="outline" 
                class="w-full justify-start"
                @click="navigateToPassword"
              >
                🔒 Changer le mot de passe
              </Button>
            </div>
          </Card>
        </div>

        <!-- Section statistiques -->
        <div class="mt-8">
          <Card class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Statistiques
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">0</div>
                <div class="text-sm text-gray-600">Contrats actifs</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">0</div>
                <div class="text-sm text-gray-600">Factures payées</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600">0</div>
                <div class="text-sm text-gray-600">Interventions</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">0</div>
                <div class="text-sm text-gray-600">Agences</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Card from '@/components/ui/card/Card.vue'
import Button from '@/components/ui/button/Button.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const navigateToUsers = () => {
  // TODO: Implémenter la navigation vers la gestion des utilisateurs
  console.log('Navigation vers la gestion des utilisateurs')
}

const navigateToProfile = () => {
  // TODO: Implémenter la navigation vers le profil
  console.log('Navigation vers le profil')
}

const navigateToPassword = () => {
  // TODO: Implémenter la navigation vers le changement de mot de passe
  console.log('Navigation vers le changement de mot de passe')
}
</script> 