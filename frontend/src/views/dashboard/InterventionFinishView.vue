<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- En-tête -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div class="flex items-center gap-3">
            <button @click="goBack" class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-arrow-left"></i>
            </button>
            <h1 class="text-2xl font-bold text-blue-800">
              Terminer l'intervention
            </h1>
          </div>
          <p class="mt-1 text-gray-600">
            Intervention #{{ interventionId }} - {{ typeLabel(intervention?.type) }}
          </p>
        </div>
      </div>

      <!-- Formulaire -->
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
        
        <form v-else @submit.prevent="finishIntervention" class="p-6">
          <!-- Résumé de l'intervention -->
          <div class="mb-6 bg-blue-50 rounded-lg p-4">
            <h3 class="text-lg font-medium text-blue-800 mb-2">Résumé de l'intervention</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Type:</p>
                <p class="font-medium">{{ typeLabel(intervention?.type) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Date planifiée:</p>
                <p class="font-medium">{{ formatDateTime(intervention?.datePlanifiee) }}</p>
              </div>
              <div v-if="intervention?.contratId">
                <p class="text-sm text-gray-500">Contrat associé:</p>
                <p class="font-medium">{{ intervention.contratId }}</p>
              </div>
              <div v-if="intervention?.compteurId">
                <p class="text-sm text-gray-500">Compteur associé:</p>
                <p class="font-medium">{{ intervention.compteurId }}</p>
              </div>
              <div v-if="intervention?.description" class="col-span-2">
                <p class="text-sm text-gray-500">Description:</p>
                <p class="font-medium">{{ intervention.description }}</p>
              </div>
            </div>
          </div>

          <!-- Résultat -->
          <div class="mb-6">
            <label for="resultat" class="block text-sm font-medium text-gray-700 mb-1">Résultat de l'intervention *</label>
            <textarea
              id="resultat"
              v-model="formData.resultat"
              rows="4"
              placeholder="Décrivez le résultat de l'intervention en détail"
              required
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.resultat }"
            ></textarea>
            <p v-if="errors.resultat" class="mt-1 text-sm text-red-600">{{ errors.resultat }}</p>
          </div>

          <!-- Coût -->
          <div class="mb-6">
            <label for="cout" class="block text-sm font-medium text-gray-700 mb-1">Coût de l'intervention (€)</label>
            <input
              id="cout"
              type="number"
              v-model="formData.cout"
              placeholder="0.00"
              step="0.01"
              min="0"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.cout }"
            />
            <p v-if="errors.cout" class="mt-1 text-sm text-red-600">{{ errors.cout }}</p>
          </div>
          
          <!-- Relevé (si type RELEVE) -->
          <div v-if="intervention?.type === 'RELEVE'" class="mb-6">
            <label for="valeurReleve" class="block text-sm font-medium text-gray-700 mb-1">Valeur du relevé (m³) *</label>
            <input
              id="valeurReleve"
              type="number"
              v-model="formData.valeurReleve"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.valeurReleve }"
            />
            <p v-if="errors.valeurReleve" class="mt-1 text-sm text-red-600">{{ errors.valeurReleve }}</p>
          </div>
          
          <!-- Pièces remplacées (si type REPARATION) -->
          <div v-if="intervention?.type === 'REPARATION'" class="mb-6">
            <label for="piecesRemplacees" class="block text-sm font-medium text-gray-700 mb-1">Pièces remplacées</label>
            <textarea
              id="piecesRemplacees"
              v-model="formData.piecesRemplacees"
              rows="2"
              placeholder="Listez les pièces remplacées"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.piecesRemplacees }"
            ></textarea>
            <p v-if="errors.piecesRemplacees" class="mt-1 text-sm text-red-600">{{ errors.piecesRemplacees }}</p>
          </div>

          <!-- Photos (placeholder pour future fonctionnalité) -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-gray-700">Photos de l'intervention</label>
              <button type="button" class="text-sm text-blue-600">+ Ajouter</button>
            </div>
            <div class="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
              <i class="fas fa-camera text-gray-400 text-3xl mb-2"></i>
              <p class="text-gray-500">Aucune photo ajoutée</p>
              <p class="text-xs text-gray-400 mt-1">Formats acceptés: JPG, PNG (max 5MB)</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 flex justify-end gap-3">
            <button
              type="button"
              @click="goBack"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              :disabled="isSubmitting"
            >
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Terminer l'intervention
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInterventionStore } from '@/stores/intervention.store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Store et router
const interventionStore = useInterventionStore();
const route = useRoute();
const router = useRouter();

// État réactif
const loading = computed(() => interventionStore.isLoading);
const isSubmitting = ref(false);
const interventionId = computed(() => route.params.id as string);
const intervention = computed(() => interventionStore.getCurrentIntervention);

// Formulaire
const formData = reactive({
  resultat: '',
  cout: null as number | null,
  valeurReleve: null as number | null,
  piecesRemplacees: '',
  dateFinIntervention: new Date().toISOString()
});

// Gestion des erreurs
const errors = reactive({
  resultat: '',
  cout: '',
  valeurReleve: '',
  piecesRemplacees: ''
});

// Fonctions utilitaires
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

// Actions
const fetchIntervention = async () => {
  try {
    await interventionStore.getInterventionById(interventionId.value);
    
    // Vérification que l'intervention est en cours
    if (intervention.value?.statut !== 'EN_COURS') {
      alert('Cette intervention ne peut pas être terminée car elle n\'est pas en cours.');
      goBack();
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'intervention:', error);
    goBack();
  }
};

const validateForm = () => {
  // Réinitialiser les erreurs
  Object.keys(errors).forEach(key => {
    // @ts-ignore
    errors[key] = '';
  });
  
  let isValid = true;
  
  // Validation du résultat
  if (!formData.resultat || formData.resultat.trim() === '') {
    errors.resultat = 'Le résultat de l\'intervention est requis';
    isValid = false;
  }
  
  // Validation du coût
  if (formData.cout !== null && formData.cout < 0) {
    errors.cout = 'Le coût ne peut pas être négatif';
    isValid = false;
  }
  
  // Validation spécifique au type de l'intervention
  if (intervention.value?.type === 'RELEVE') {
    if (!formData.valeurReleve && formData.valeurReleve !== 0) {
      errors.valeurReleve = 'La valeur du relevé est requise';
      isValid = false;
    }
  }
  
  return isValid;
};

const finishIntervention = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  try {
    // Préparer les données pour l'API
    const finishData = {
      resultat: formData.resultat,
      dateFinIntervention: formData.dateFinIntervention
    };
    
    // Ajouter des données conditionnelles
    if (formData.cout !== null) {
      // @ts-ignore
      finishData.cout = formData.cout;
    }
    
    if (intervention.value?.type === 'RELEVE' && formData.valeurReleve !== null) {
      // @ts-ignore
      finishData.valeurReleve = formData.valeurReleve;
      
      // Si c'est un relevé et qu'il y a un compteurId, on pourrait mettre à jour la valeur du compteur
      // Cette fonctionnalité pourrait être ajoutée dans le futur
    }
    
    // Appel à l'API pour terminer l'intervention
    await interventionStore.finishIntervention(interventionId.value, finishData);
    
    // Redirection après succès
    router.push(`/dashboard/interventions/${interventionId.value}`);
  } catch (error) {
    console.error('Erreur lors de la terminaison de l\'intervention:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push(`/dashboard/interventions/${interventionId.value}`);
};

// Cycle de vie
onMounted(() => {
  fetchIntervention();
});
</script>
