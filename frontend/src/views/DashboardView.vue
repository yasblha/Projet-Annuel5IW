<template>
  <DashboardSection title="Tableau de bord">
    <div class="flex items-center justify-between mb-6">
      <p class="text-gray-600">
        Bonne journée, {{ authStore.userFullName }} ! Voici un aperçu de votre activité.
      </p>
      <!-- Bouton 'Nouvelle intervention' supprimé ici -->
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard

        title="Contrats actifs"
        value="12"
        description="Contrats en cours"
        icon="fas fa-file-contract"
        color="blue"
        :trend="5"
      />
      <StatCard

        title="Factures payées"
        value="8"
        description="Ce mois"
        icon="fas fa-check-circle"
        color="green"
        :trend="12"
      />
      <StatCard

        title="Interventions"
        value="3"
        description="En cours"
        icon="fas fa-tools"
        color="orange"
        :trend="-2"
      />
      <StatCard

        title="Agences"
        value="5"
        description="Actives"
        icon="fas fa-building"
        color="purple"
        :trend="0"
      />
    </div>
  </DashboardSection>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
    <!-- Informations utilisateur -->
    <div class="lg:col-span-1">
      <UserSummary
        :fullName="authStore.userFullName"
        :initials="(authStore.user?.prenom?.charAt(0) || '') + (authStore.user?.nom?.charAt(0) || '')"
        :role="authStore.user?.role || ''"
        :email="authStore.user?.email || ''"
        :telephone="authStore.user?.telephone"
        :statut="authStore.user?.statut"
        :onProfile="navigateToProfile"
      >
        <template #actions>
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
        </template>
      </UserSummary>
    </div>
    <!-- Activités récentes -->
    <div class="lg:col-span-2">
      <DashboardSection title="Activités récentes" icon="fas fa-history">
        <RecentActivity />
      </DashboardSection>
    </div>
  </div>

  <DashboardSection title="Analyses et rapports" icon="fas fa-chart-pie">
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
  </DashboardSection>

</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import StatCard from '@/components/dashboard/StatCard.vue'
import UserSummary from '@/components/dashboard/UserSummary.vue'
import DashboardSection from '@/components/dashboard/DashboardSection.vue'
import Button from '@/components/ui/button/Button.vue'

import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()


const navigateToProfile = () => {
  router.push('/profile')
}

const navigateToPassword = () => {
  router.push('/change-password')
}
</script> 