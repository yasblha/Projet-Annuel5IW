<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <div class="max-w-5xl mx-auto">
      <!-- En-tête avec actions -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div class="flex items-center gap-3">
            <button @click="goBack" class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-arrow-left"></i>
            </button>
            <h1 class="text-2xl font-bold text-blue-800">
              Détails de l'intervention
            </h1>
          </div>
          <p class="mt-1 text-gray-600">
            {{ typeLabel(intervention?.type) }} - {{ formatDate(intervention?.datePlanifiee) }}
          </p>
        </div>
        <div class="mt-4 md:mt-0 flex gap-3">
          <button 
            v-if="intervention?.statut === 'PLANIFIEE'"
            @click="startIntervention" 
            class="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2"
          >
            <i class="fas fa-play"></i> Démarrer
          </button>
          <button 
            v-if="intervention?.statut === 'EN_COURS'"
            @click="finishIntervention" 
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
          >
            <i class="fas fa-check-circle"></i> Terminer
          </button>
          <button 
            v-if="intervention?.statut === 'PLANIFIEE'"
            @click="cancelIntervention" 
            class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
          >
            <i class="fas fa-times-circle"></i> Annuler
          </button>
          <button 
            @click="editIntervention" 
            class="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 transition flex items-center gap-2"
          >
            <i class="fas fa-edit"></i> Modifier
          </button>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div v-if="loading" class="p-8 flex justify-center">
          <div class="flex flex-col items-center">
            <svg class="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-500">Chargement des détails de l'intervention...</span>
          </div>
        </div>

        <div v-else-if="intervention">
          <!-- Statut et infos générales -->
          <div class="border-b border-gray-100 p-6">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <span 
                  :class="statusClass(intervention.statut)" 
                  class="text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {{ statusLabel(intervention.statut) }}
                </span>
                <h2 class="text-xl font-semibold mt-2">
                  {{ typeLabel(intervention.type) }} - {{ formatDateTime(intervention.datePlanifiee) }}
                </h2>
              </div>
              <div class="mt-3 md:mt-0 text-right">
                <p class="text-sm text-gray-500">ID: <span class="font-mono">{{ intervention.id }}</span></p>
                <p v-if="intervention.dateCreation" class="text-sm text-gray-500">
                  Créée le {{ formatDateTime(intervention.dateCreation) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Détails de l'intervention -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
              <dl class="space-y-2">
                <div class="flex flex-col sm:flex-row sm:justify-between">
                  <dt class="text-sm font-medium text-gray-500">Type</dt>
                  <dd class="text-sm text-gray-900">{{ typeLabel(intervention.type) }}</dd>
                </div>
                <div class="flex flex-col sm:flex-row sm:justify-between">
                  <dt class="text-sm font-medium text-gray-500">Statut</dt>
                  <dd class="text-sm text-gray-900">{{ statusLabel(intervention.statut) }}</dd>
                </div>
                <div class="flex flex-col sm:flex-row sm:justify-between">
                  <dt class="text-sm font-medium text-gray-500">Date planifiée</dt>
                  <dd class="text-sm text-gray-900">{{ formatDateTime(intervention.datePlanifiee) }}</dd>
                </div>
                <div v-if="intervention.priorite" class="flex flex-col sm:flex-row sm:justify-between">
                  <dt class="text-sm font-medium text-gray-500">Priorité</dt>
                  <dd class="text-sm text-gray-900">
                    <span 
                      :class="{
                        'bg-red-100 text-red-800': intervention.priorite === 'HAUTE',
                        'bg-yellow-100 text-yellow-800': intervention.priorite === 'MOYENNE',
                        'bg-blue-100 text-blue-800': intervention.priorite === 'BASSE'
                      }"
                      class="px-2 py-0.5 rounded text-xs font-medium"
                    >
                      {{ intervention.priorite }}
                    </span>
                  </dd>
                </div>
                <div v-if="intervention.technicienId" class="flex flex-col sm:flex-row sm:justify-between">
                  <dt class="text-sm font-medium text-gray-500">Technicien</dt>
                  <dd class="text-sm text-gray-900">{{ intervention.technicienId }}</dd>
                </div>
              </dl>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Détails de la mission</h3>
              <dl class="space-y-2">
                <div class="flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">Description</dt>
                  <dd class="text-sm text-gray-900 mt-1">
                    {{ intervention.description || 'Aucune description fournie' }}
                  </dd>
                </div>
                <div v-if="intervention.contratId" class="flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">Contrat associé</dt>
                  <dd class="text-sm text-gray-900 mt-1">
                    <router-link 
                      :to="`/dashboard/contrats/${intervention.contratId}`"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      {{ intervention.contratId }}
                      <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                    </router-link>
                  </dd>
                </div>
                <div v-if="intervention.compteurId" class="flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">Compteur associé</dt>
                  <dd class="text-sm text-gray-900 mt-1">
                    <router-link 
                      :to="`/dashboard/compteurs/${intervention.compteurId}`"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      {{ intervention.compteurId }}
                      <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                    </router-link>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Résultats (si terminée) -->
          <div v-if="intervention.statut === 'TERMINEE'" class="border-t border-gray-100 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Résultats de l'intervention</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <dl class="space-y-3">
                <div class="flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">Résultat</dt>
                  <dd class="text-sm text-gray-900 mt-1">{{ intervention.resultat || 'Non spécifié' }}</dd>
                </div>
                <div v-if="intervention.cout !== undefined" class="flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">Coût</dt>
                  <dd class="text-sm text-gray-900 mt-1">{{ intervention.cout }} €</dd>
                </div>
                <div v-if="intervention.dateFinIntervention" class="flex flex-col">
                  <dt class="text-sm font-medium text-gray-500">Date de fin</dt>
                  <dd class="text-sm text-gray-900 mt-1">{{ formatDateTime(intervention.dateFinIntervention) }}</dd>
                </div>
                <!-- Notes et commentaires (à ajouter dans le futur) -->
              </dl>
            </div>
          </div>

          <!-- Photos (placeholder pour future fonctionnalité) -->
          <div class="border-t border-gray-100 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Photos et documents</h3>
            <div class="bg-gray-50 p-4 rounded-lg text-center py-8">
              <i class="fas fa-images text-gray-400 text-4xl mb-3"></i>
              <p class="text-gray-500">Aucune photo ou document n'a été ajouté à cette intervention</p>
              <button class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                <i class="fas fa-upload mr-2"></i> Ajouter des photos
              </button>
            </div>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div v-else class="p-8 flex justify-center">
          <div class="flex flex-col items-center text-red-600">
            <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
            <p>Impossible de charger les détails de cette intervention.</p>
            <button @click="fetchIntervention" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInterventionStore } from '@/stores/intervention.store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Intervention } from '@/types/intervention.types';

// Store et router
const interventionStore = useInterventionStore();
const route = useRoute();
const router = useRouter();

// État réactif
const loading = computed(() => interventionStore.isLoading);
const intervention = computed(() => interventionStore.getCurrentIntervention);
const interventionId = computed(() => route.params.id as string);

// Fonctions utilitaires
const formatDate = (date?: string) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd MMM yyyy', { locale: fr });
  } catch (e) {
    return date;
  }
};

const formatDateTime = (date?: string) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd MMM yyyy à HH:mm', { locale: fr });
  } catch (e) {
    return date;
  }
};

const typeLabel = (type?: string) => {
  if (!type) return '';
  const labels: Record<string, string> = {
    'INSTALLATION': 'Installation',
    'REPARATION': 'Réparation',
    'RELEVE': 'Relevé'
  };
  return labels[type] || type;
};

const statusLabel = (status?: string) => {
  if (!status) return '';
  const labels: Record<string, string> = {
    'PLANIFIEE': 'Planifiée',
    'EN_COURS': 'En cours',
    'TERMINEE': 'Terminée',
    'ANNULEE': 'Annulée'
  };
  return labels[status] || status;
};

const statusClass = (status?: string) => {
  if (!status) return '';
  const classes: Record<string, string> = {
    'PLANIFIEE': 'bg-yellow-100 text-yellow-800',
    'EN_COURS': 'bg-blue-100 text-blue-800',
    'TERMINEE': 'bg-green-100 text-green-800',
    'ANNULEE': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// Actions
const fetchIntervention = async () => {
  try {
    await interventionStore.getInterventionById(interventionId.value);
  } catch (error) {
    console.error('Erreur lors du chargement de l\'intervention:', error);
  }
};

const goBack = () => {
  router.push('/dashboard/interventions');
};

const editIntervention = () => {
  router.push(`/dashboard/interventions/${interventionId.value}/edit`);
};

const startIntervention = async () => {
  try {
    await interventionStore.updateInterventionStatus(interventionId.value, 'EN_COURS');
    await fetchIntervention();
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'intervention:', error);
  }
};

const finishIntervention = () => {
  router.push(`/dashboard/interventions/${interventionId.value}/finish`);
};

const cancelIntervention = async () => {
  if (confirm('Êtes-vous sûr de vouloir annuler cette intervention ?')) {
    try {
      await interventionStore.cancelIntervention(interventionId.value, 'Annulé par l\'utilisateur');
      await fetchIntervention();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'intervention:', error);
    }
  }
};

// Cycle de vie
onMounted(() => {
  fetchIntervention();
});
</script>
