<template>
  <div class="recent-activity">
    <div class="activity-header">
      <h3 class="activity-title">Activités récentes</h3>
      <button class="view-all-btn">
        <i class="fas fa-external-link-alt mr-1"></i>
        Voir tout
      </button>
    </div>
    
    <div class="activity-list">
      <div 
        v-for="activity in activities" 
        :key="activity.id"
        class="activity-item"
      >
        <div class="activity-icon" :class="`bg-${activity.color}-100`">
          <i :class="[activity.icon, `text-${activity.color}-600`]"></i>
        </div>
        
        <div class="activity-content">
          <div class="activity-main">
            <p class="activity-text">{{ activity.text }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
          <p class="activity-subtitle">{{ activity.subtitle }}</p>
        </div>
        
        <div class="activity-status" v-if="activity.status">
          <span 
            class="status-badge"
            :class="getStatusClass(activity.status)"
          >
            {{ activity.status }}
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="activities.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-clipboard-list text-4xl text-gray-400"></i>
      </div>
      <p class="empty-text">Aucune activité récente</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Activity {
  id: number
  icon: string
  text: string
  subtitle: string
  time: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  status?: string
}

// Mock data
const activities = ref<Activity[]>([
  {
    id: 1,
    icon: 'fas fa-file-invoice-dollar',
    text: 'Nouvelle facture générée',
    subtitle: 'Facture #F2024-001 pour le contrat C2024-001',
    time: 'Il y a 5 minutes',
    color: 'blue',
    status: 'En attente'
  },
  {
    id: 2,
    icon: 'fas fa-check-circle',
    text: 'Paiement reçu',
    subtitle: 'Paiement de 150€ pour la facture #F2024-001',
    time: 'Il y a 1 heure',
    color: 'green',
    status: 'Payé'
  },
  {
    id: 3,
    icon: 'fas fa-tools',
    text: 'Intervention programmée',
    subtitle: 'Maintenance préventive - Compteur #CTR-001',
    time: 'Il y a 2 heures',
    color: 'orange',
    status: 'Programmée'
  },
  {
    id: 4,
    icon: 'fas fa-file-contract',
    text: 'Nouveau contrat créé',
    subtitle: 'Contrat #C2024-002 pour l\'entreprise ABC',
    time: 'Il y a 3 heures',
    color: 'purple',
    status: 'Actif'
  },
  {
    id: 5,
    icon: 'fas fa-exclamation-triangle',
    text: 'Alerte de consommation',
    subtitle: 'Consommation anormale détectée sur le compteur #CTR-002',
    time: 'Il y a 4 heures',
    color: 'red',
    status: 'En cours'
  }
])

const getStatusClass = (status: string) => {
  const statusClasses: Record<string, string> = {
    'En attente': 'bg-yellow-100 text-yellow-800',
    'Payé': 'bg-green-100 text-green-800',
    'Programmée': 'bg-blue-100 text-blue-800',
    'Actif': 'bg-green-100 text-green-800',
    'En cours': 'bg-orange-100 text-orange-800',
    'Terminé': 'bg-gray-100 text-gray-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.recent-activity {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}

.activity-header {
  @apply flex items-center justify-between mb-6;
}

.activity-title {
  @apply text-lg font-medium text-gray-900;
}

.view-all-btn {
  @apply text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center;
}

.activity-list {
  @apply space-y-4;
}

.activity-item {
  @apply flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200;
}

.activity-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0;
}

.activity-icon i {
  @apply text-lg;
}

.activity-content {
  @apply flex-1 min-w-0;
}

.activity-main {
  @apply flex items-center justify-between;
}

.activity-text {
  @apply text-sm font-medium text-gray-900;
}

.activity-time {
  @apply text-xs text-gray-500 ml-2;
}

.activity-subtitle {
  @apply text-sm text-gray-600 mt-1;
}

.activity-status {
  @apply flex-shrink-0;
}

.status-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.empty-state {
  @apply text-center py-8;
}

.empty-icon {
  @apply mb-2;
}

.empty-text {
  @apply text-gray-500;
}
</style> 