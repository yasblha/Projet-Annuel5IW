<template>
  <Layout>
    <!-- En-tête de la page -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Tableau de bord
      </h1>
      <p class="text-gray-600">
        Bienvenue, {{ authStore.userFullName }}. Voici un aperçu de votre activité.
      </p>
    </div>

    <!-- Cartes de statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <DashboardCard
        title="Contrats actifs"
        value="12"
        description="Contrats en cours"
        icon="fas fa-file-contract"
        color="blue"
        :trend="5"
      />
      
      <DashboardCard
        title="Factures payées"
        value="8"
        description="Ce mois"
        icon="fas fa-check-circle"
        color="green"
        :trend="12"
      />
      
      <DashboardCard
        title="Interventions"
        value="3"
        description="En cours"
        icon="fas fa-tools"
        color="orange"
        :trend="-2"
      />
      
      <DashboardCard
        title="Agences"
        value="5"
        description="Actives"
        icon="fas fa-building"
        color="purple"
        :trend="0"
      />
    </div>

    <!-- Contenu principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Informations utilisateur -->
      <div class="lg:col-span-1">
        <Card class="p-6">
          <div class="flex items-center space-x-4 mb-6">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-2xl font-bold">
                {{ authStore.user?.prenom?.charAt(0) }}{{ authStore.user?.nom?.charAt(0) }}
              </span>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">
                {{ authStore.userFullName }}
              </h3>
              <p class="text-sm text-gray-500">{{ authStore.user?.role }}</p>
            </div>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Email:</span>
              <span class="text-sm font-medium">{{ authStore.user?.email }}</span>
            </div>
            <div v-if="authStore.user?.telephone" class="flex justify-between">
              <span class="text-sm text-gray-600">Téléphone:</span>
              <span class="text-sm font-medium">{{ authStore.user.telephone }}</span>
            </div>
            <div v-if="authStore.user?.statut" class="flex justify-between">
              <span class="text-sm text-gray-600">Statut:</span>
              <span class="text-sm font-medium">{{ authStore.user.statut }}</span>
            </div>
          </div>
          
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Actions rapides</h4>
            <div class="space-y-2">
              <Button 
                v-if="authStore.isAdmin" 
                variant="outline" 
                class="w-full justify-start"
                @click="navigateToUsers"
              >
                <i class="fas fa-users mr-2"></i>
                Gérer les utilisateurs
              </Button>
              <Button 
                variant="outline" 
                class="w-full justify-start"
                @click="navigateToProfile"
              >
                <i class="fas fa-user mr-2"></i>
                Modifier le profil
              </Button>
              <Button 
                variant="outline" 
                class="w-full justify-start"
                @click="navigateToPassword"
              >
                <i class="fas fa-lock mr-2"></i>
                Changer le mot de passe
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Activités récentes -->
      <div class="lg:col-span-2">
        <RecentActivity />
      </div>
    </div>

    <!-- Graphiques et analyses -->
    <div class="mt-8">
      <Card class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Analyses et rapports
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Graphique de consommation -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Consommation d'eau</h4>
            <div class="h-32 bg-white rounded border flex items-center justify-center">
              <div class="text-center">
                <i class="fas fa-chart-line text-2xl text-gray-400 mb-2"></i>
                <p class="text-gray-500 text-sm">Graphique de consommation</p>
              </div>
            </div>
          </div>
          
          <!-- Graphique de facturation -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Évolution des factures</h4>
            <div class="h-32 bg-white rounded border flex items-center justify-center">
              <div class="text-center">
                <i class="fas fa-chart-bar text-2xl text-gray-400 mb-2"></i>
                <p class="text-gray-500 text-sm">Graphique de facturation</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'
import Card from '@/components/ui/card/Card.vue'
import Button from '@/components/ui/button/Button.vue'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const navigateToUsers = () => {
  // TODO: Implémenter la navigation vers la gestion des utilisateurs
  console.log('Navigation vers la gestion des utilisateurs')
}

const navigateToProfile = () => {
  router.push('/profile')
}

const navigateToPassword = () => {
  router.push('/change-password')
}
</script> 