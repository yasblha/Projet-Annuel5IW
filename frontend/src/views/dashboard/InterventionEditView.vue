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
              {{ isEditMode ? 'Modifier l\'intervention' : 'Nouvelle intervention' }}
            </h1>
          </div>
          <p v-if="isEditMode" class="mt-1 text-gray-600">
            ID: {{ interventionId }}
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
            <span class="text-gray-500">Chargement...</span>
          </div>
        </div>
        
        <form v-else @submit.prevent="saveIntervention" class="p-6">
          <!-- Type d'intervention -->
          <div class="mb-6">
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type d'intervention *</label>
            <select
              id="type"
              v-model="formData.type"
              required
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.type }"
            >
              <option value="" disabled selected>Sélectionnez un type</option>
              <option value="INSTALLATION">Installation</option>
              <option value="REPARATION">Réparation</option>
              <option value="RELEVE">Relevé</option>
            </select>
            <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
          </div>
          
          <!-- Date planifiée -->
          <div class="mb-6">
            <label for="datePlanifiee" class="block text-sm font-medium text-gray-700 mb-1">Date planifiée *</label>
            <input
              id="datePlanifiee"
              type="datetime-local"
              v-model="formData.datePlanifiee"
              required
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.datePlanifiee }"
            />
            <p v-if="errors.datePlanifiee" class="mt-1 text-sm text-red-600">{{ errors.datePlanifiee }}</p>
          </div>

          <!-- Champs conditionnels basés sur le type -->
          <div v-if="formData.type === 'INSTALLATION'" class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="font-medium text-blue-800 mb-3">Informations d'installation</h3>
            
            <!-- Contrat associé -->
            <div class="mb-4">
              <label for="contratId" class="block text-sm font-medium text-gray-700 mb-1">Contrat associé *</label>
              <input
                id="contratId"
                type="text"
                v-model="formData.contratId"
                placeholder="ID du contrat"
                class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': errors.contratId }"
              />
              <p v-if="errors.contratId" class="mt-1 text-sm text-red-600">{{ errors.contratId }}</p>
            </div>
          </div>

          <div v-else class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="font-medium text-blue-800 mb-3">Informations de l'intervention</h3>
            
            <!-- Compteur associé -->
            <div class="mb-4">
              <label for="compteurId" class="block text-sm font-medium text-gray-700 mb-1">Compteur associé *</label>
              <input
                id="compteurId"
                type="text"
                v-model="formData.compteurId"
                placeholder="ID du compteur"
                class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': errors.compteurId }"
              />
              <p v-if="errors.compteurId" class="mt-1 text-sm text-red-600">{{ errors.compteurId }}</p>
            </div>
          </div>

          <!-- Technicien -->
          <div class="mb-6">
            <label for="technicienId" class="block text-sm font-medium text-gray-700 mb-1">Technicien assigné</label>
            <input
              id="technicienId"
              type="text"
              v-model="formData.technicienId"
              placeholder="ID du technicien"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.technicienId }"
            />
            <p v-if="errors.technicienId" class="mt-1 text-sm text-red-600">{{ errors.technicienId }}</p>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="4"
              placeholder="Description détaillée de l'intervention"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.description }"
            ></textarea>
            <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
          </div>

          <!-- Priorité -->
          <div class="mb-6">
            <label for="priorite" class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
            <select
              id="priorite"
              v-model="formData.priorite"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.priorite }"
            >
              <option value="" selected>Standard</option>
              <option value="HAUTE">Haute</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="BASSE">Basse</option>
            </select>
            <p v-if="errors.priorite" class="mt-1 text-sm text-red-600">{{ errors.priorite }}</p>
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
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              :disabled="isSubmitting"
            >
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
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
import type { CreateInterventionDto } from '@/types/intervention.types';

// Store et router
const interventionStore = useInterventionStore();
const route = useRoute();
const router = useRouter();

// État réactif
const loading = ref(false);
const isSubmitting = ref(false);
const interventionId = computed(() => route.params.id as string);
const isEditMode = computed(() => route.path.includes('/edit'));

// Formulaire
const formData = reactive<CreateInterventionDto>({
  type: '',
  datePlanifiee: '',
  contratId: '',
  compteurId: '',
  technicienId: '',
  description: '',
  priorite: ''
});

// Gestion des erreurs
const errors = reactive({
  type: '',
  datePlanifiee: '',
  contratId: '',
  compteurId: '',
  technicienId: '',
  description: '',
  priorite: ''
});

// Actions
const fetchIntervention = async () => {
  if (!isEditMode.value) return;
  
  loading.value = true;
  try {
    await interventionStore.getInterventionById(interventionId.value);
    const intervention = interventionStore.getCurrentIntervention;
    
    if (intervention) {
      // Mapper les données de l'intervention au formulaire
      formData.type = intervention.type;
      formData.datePlanifiee = formatDateForInput(intervention.datePlanifiee);
      formData.contratId = intervention.contratId || '';
      formData.compteurId = intervention.compteurId || '';
      formData.technicienId = intervention.technicienId || '';
      formData.description = intervention.description || '';
      formData.priorite = intervention.priorite || '';
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'intervention:', error);
  } finally {
    loading.value = false;
  }
};

const validateForm = () => {
  // Réinitialiser les erreurs
  Object.keys(errors).forEach(key => {
    // @ts-ignore
    errors[key] = '';
  });
  
  let isValid = true;
  
  // Validation du type
  if (!formData.type) {
    errors.type = 'Le type d\'intervention est requis';
    isValid = false;
  }
  
  // Validation de la date
  if (!formData.datePlanifiee) {
    errors.datePlanifiee = 'La date planifiée est requise';
    isValid = false;
  }
  
  // Validation selon le type
  if (formData.type === 'INSTALLATION') {
    if (!formData.contratId) {
      errors.contratId = 'Le contrat est requis pour une installation';
      isValid = false;
    }
  } else if (formData.type) {
    if (!formData.compteurId) {
      errors.compteurId = 'Le compteur est requis pour ce type d\'intervention';
      isValid = false;
    }
  }
  
  return isValid;
};

const saveIntervention = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  try {
    // S'assurer que la date est au format ISO
    const formattedData = {
      ...formData,
      datePlanifiee: new Date(formData.datePlanifiee).toISOString()
    };
    
    if (isEditMode.value) {
      // La mise à jour d'intervention n'est pas implémentée dans l'API, donc on pourrait rediriger
      // vers la page de détails pour l'instant
      await interventionStore.createIntervention(formattedData);
    } else {
      await interventionStore.createIntervention(formattedData);
    }
    
    // Redirection après succès
    router.push('/dashboard/interventions');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'intervention:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Format YYYY-MM-DDThh:mm
    return date.toISOString().substring(0, 16);
  } catch (e) {
    return '';
  }
};

const goBack = () => {
  router.push(isEditMode.value ? `/dashboard/interventions/${interventionId.value}` : '/dashboard/interventions');
};

// Cycle de vie
onMounted(() => {
  fetchIntervention();
});
</script>
