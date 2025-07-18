<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
    <div class="max-w-3xl mx-auto">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Créer un nouveau contrat</h1>
        <button 
          @click="goBack" 
          class="text-gray-600 hover:text-gray-900"
        >
          <i class="fas fa-times"></i> Annuler
        </button>
      </div>

      <!-- Indicateur de chargement -->
      <div v-if="loading" class="flex justify-center my-12">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
        <span class="ml-3 text-xl text-gray-600">Chargement...</span>
      </div>
      
      <!-- Message d'erreur -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-circle text-red-400"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Formulaire de création -->
      <form @submit.prevent="createContract" class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="p-6">
          <div class="mb-6">
            <label for="client" class="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              id="client"
              v-model="formData.clientId"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="" disabled>Sélectionnez un client</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.nom }} {{ client.prenom }} ({{ client.email }})
              </option>
            </select>
          </div>

          <div class="mb-6">
            <label for="template" class="block text-sm font-medium text-gray-700 mb-1">Template de contrat</label>
            <select
              id="template"
              v-model="formData.templateId"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @change="loadTemplateDetails"
            >
              <option value="" disabled>Sélectionnez un template</option>
              <option v-for="template in templates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>

          <!-- Aperçu du template sélectionné -->
          <div v-if="selectedTemplate" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Détails du template</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Prix</p>
                <p class="text-base font-medium">{{ formatPrice(selectedTemplate.price) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Périodicité</p>
                <p class="text-base font-medium">{{ selectedTemplate.periodicity }}</p>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-500">Aperçu du contenu</p>
              <div class="mt-2 p-3 bg-white border border-gray-200 rounded prose max-w-none" v-html="renderedContent"></div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                id="startDate"
                v-model="formData.startDate"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">Date de fin (optionnelle)</label>
              <input
                type="date"
                id="endDate"
                v-model="formData.endDate"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
          <button
            type="button"
            @click="goBack"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <i :class="[loading ? 'fa-spinner fa-spin' : 'fa-save', 'fas mr-2']"></i>
            Créer le contrat
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContractV2Store } from '@/stores/contract-v2.store';
import type { TemplateV2 } from '@/services/api/contract-v2.service';
import { marked } from 'marked';

// Importer le store client pour récupérer la liste des clients
import { useClientStore } from '@/stores/client.store';

const router = useRouter();
const contractStore = useContractV2Store();
const clientStore = useClientStore();

// État local
const formData = ref({
  clientId: '',
  templateId: '',
  startDate: new Date().toISOString().split('T')[0], // Date du jour par défaut
  endDate: ''
});
const clients = ref<any[]>([]);
const templates = ref<TemplateV2[]>([]);
const selectedTemplate = ref<TemplateV2 | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Computed properties
const renderedContent = computed(() => {
  if (!selectedTemplate.value || !selectedTemplate.value.bodyMd) return '';
  return marked(selectedTemplate.value.bodyMd);
});

// Méthodes
const loadClients = async () => {
  loading.value = true;
  try {
    const result = await clientStore.listClients();
    clients.value = clientStore.getClients;
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des clients';
  } finally {
    loading.value = false;
  }
};

const loadTemplates = async () => {
  loading.value = true;
  try {
    await contractStore.listTemplates();
    templates.value = contractStore.getTemplates;
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des templates';
  } finally {
    loading.value = false;
  }
};

const loadTemplateDetails = async () => {
  if (!formData.value.templateId) {
    selectedTemplate.value = null;
    return;
  }
  
  loading.value = true;
  try {
    const template = await contractStore.getTemplateById(formData.value.templateId);
    selectedTemplate.value = template;
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des détails du template';
    selectedTemplate.value = null;
  } finally {
    loading.value = false;
  }
};

const createContract = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const result = await contractStore.createContract({
      clientId: formData.value.clientId,
      templateId: formData.value.templateId,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate || undefined
    });
    
    // Rediriger vers la page de détails du contrat créé
    router.push(`/contracts/v2/${result.id}`);
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la création du contrat';
  } finally {
    loading.value = false;
  }
};

const formatPrice = (price?: number): string => {
  if (price === undefined || price === null) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const goBack = () => {
  router.push('/contracts/v2');
};

// Charger les données au montage du composant
onMounted(() => {
  loadClients();
  loadTemplates();
});
</script>
