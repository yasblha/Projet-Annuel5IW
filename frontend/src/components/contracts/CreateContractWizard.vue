<template>
  <div class="contract-wizard">
    <div class="steps-indicator mb-6">
      <div class="flex justify-between">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-item flex flex-col items-center"
          :class="{ 
            'text-blue-600': currentStep >= index,
            'text-gray-400': currentStep < index
          }"
        >
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center mb-2"
            :class="{ 
              'bg-blue-600 text-white': currentStep > index,
              'bg-blue-100 text-blue-600 border-2 border-blue-600': currentStep === index,
              'bg-gray-200 text-gray-500': currentStep < index
            }"
          >
            <i v-if="currentStep > index" class="fas fa-check"></i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="text-xs font-medium">{{ step.title }}</span>
        </div>
      </div>
      <div class="relative mt-2">
        <div class="absolute top-0 h-1 bg-gray-200 w-full"></div>
        <div 
          class="absolute top-0 h-1 bg-blue-600 transition-all duration-300"
          :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Étape 1: Sélection du client -->
    <div v-if="currentStep === 0" class="step-content">
      <h3 class="text-lg font-semibold mb-4">Sélection du client</h3>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher un client</label>
        <div class="relative">
          <input 
            type="text" 
            v-model="clientSearch" 
            @input="searchClients"
            placeholder="Nom, prénom ou email du client" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <div v-if="isSearching" class="absolute right-3 top-2.5">
            <i class="fas fa-spinner fa-spin text-gray-400"></i>
          </div>
        </div>
      </div>

      <div v-if="clientResults.length > 0" class="mt-4 border rounded-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="client in clientResults" :key="client.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ client.nom }} {{ client.prenom }}</div>
                <div v-if="client.type === 'ENTREPRISE'" class="text-xs text-gray-500">{{ client.raisonSociale || 'Entreprise' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ client.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ client.telephone || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="selectClient(client)" 
                  class="text-blue-600 hover:text-blue-900"
                >
                  Sélectionner
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="clientSearch && !isSearching" class="mt-4 p-4 bg-gray-50 rounded-md text-center">
        <p class="text-gray-500">Aucun client trouvé</p>
        <button 
          @click="showNewClientForm = true" 
          class="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          <i class="fas fa-plus mr-2"></i> Créer un nouveau client
        </button>
      </div>

      <div v-if="selectedClient" class="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 class="font-medium text-blue-800 mb-2">Client sélectionné</h4>
        <div class="flex justify-between">
          <div>
            <p class="text-sm font-semibold">{{ selectedClient.nom }} {{ selectedClient.prenom }}</p>
            <p class="text-sm text-gray-600">{{ selectedClient.email }}</p>
            <p class="text-sm text-gray-600">{{ selectedClient.telephone || 'Pas de téléphone' }}</p>
          </div>
          <button @click="selectedClient = null" class="text-blue-600 hover:text-blue-800">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Étape 2: Sélection du template -->
    <div v-if="currentStep === 1" class="step-content">
      <h3 class="text-lg font-semibold mb-4">Sélection du template</h3>
      
      <div v-if="isLoadingTemplates" class="text-center py-8">
        <p class="text-gray-500">Chargement des templates...</p>
        <i class="fas fa-spinner fa-spin text-gray-400"></i>
      </div>
      
      <div v-else-if="templateLoadError" class="text-center py-8">
        <p class="text-gray-500">Erreur lors du chargement des templates</p>
        <button 
          @click="loadTemplates" 
          class="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          Réessayer
        </button>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="template in templates" 
          :key="template.id" 
          class="border rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition"
          :class="{ 'bg-blue-50 border-blue-500': selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <h4 class="font-medium text-lg">{{ template.name }}</h4>
          <div class="flex justify-between text-sm text-gray-500 mt-2">
            <span>{{ template.periodicity }}</span>
            <span>{{ template.price }} €</span>
          </div>
          <div class="mt-3 text-sm text-gray-600 max-h-24 overflow-hidden">
            {{ template.bodyMd.substring(0, 100) }}...
          </div>
        </div>
      </div>

      <div v-if="templates.length === 0" class="text-center py-8">
        <p class="text-gray-500">Aucun template disponible</p>
      </div>

      <div v-if="selectedTemplate" class="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 class="font-medium text-blue-800 mb-2">Template sélectionné</h4>
        <div class="flex justify-between">
          <div>
            <p class="text-sm font-semibold">{{ selectedTemplate.name }}</p>
            <p class="text-sm text-gray-600">{{ selectedTemplate.periodicity }} - {{ selectedTemplate.price }} €</p>
          </div>
          <button @click="selectedTemplate = null" class="text-blue-600 hover:text-blue-800">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Étape 3: Personnalisation du contrat -->
    <div v-if="currentStep === 2" class="step-content">
      <h3 class="text-lg font-semibold mb-4">Personnalisation du contrat</h3>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
        <input 
          type="date" 
          v-model="contractDetails.startDate"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
        <input 
          type="date" 
          v-model="contractDetails.endDate"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Prix</label>
        <input 
          type="number" 
          v-model="contractDetails.price"
          step="0.01"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea 
          v-model="contractDetails.notes"
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>
    </div>

    <!-- Étape 4: Aperçu du contrat -->
    <div v-if="currentStep === 3" class="step-content">
      <h3 class="text-lg font-semibold mb-4">Aperçu du contrat</h3>
      
      <div class="bg-white border rounded-md p-6">
        <div class="mb-6 pb-4 border-b">
          <h2 class="text-xl font-bold text-center mb-4">CONTRAT DE SERVICE</h2>
          <div class="flex justify-between text-sm">
            <div>
              <p class="font-medium">Client:</p>
              <p>{{ selectedClient?.nom }} {{ selectedClient?.prenom }}</p>
              <p>{{ selectedClient?.email }}</p>
              <p>{{ selectedClient?.telephone || '-' }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium">Période du contrat:</p>
              <p>Du {{ formatDate(contractDetails.startDate) }}</p>
              <p>Au {{ formatDate(contractDetails.endDate) }}</p>
              <p>Périodicité: {{ selectedTemplate?.periodicity }}</p>
            </div>
          </div>
        </div>
        
        <div class="mb-6 prose max-w-none" v-html="renderedContract"></div>
        
        <div class="mt-8 pt-4 border-t">
          <div class="flex justify-between">
            <div>
              <p class="font-medium">Montant total:</p>
              <p class="text-xl font-bold">{{ contractDetails.price }} €</p>
            </div>
            <div>
              <p class="font-medium">Date:</p>
              <p>{{ formatDate(new Date()) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between mt-8">
      <button 
        v-if="currentStep > 0" 
        @click="prevStep" 
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
      >
        Précédent
      </button>
      <div v-else></div>
      
      <div>
        <button 
          v-if="currentStep < steps.length - 1" 
          @click="nextStep" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          :disabled="!canProceed"
        >
          Suivant
        </button>
        <button 
          v-else 
          @click="saveContract" 
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Finaliser le contrat
        </button>
        <button 
          @click="cancel" 
          class="ml-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useClientStore } from '@/stores/client.store';
import { useContractV2Store } from '@/stores/contract-v2.store';
import { useNotificationStore } from '@/stores/notification.store';
import { marked } from 'marked';

const props = defineProps<{
  formData?: any
}>();

const emit = defineEmits(['completed', 'cancelled']);

const clientStore = useClientStore();
const contractV2Store = useContractV2Store();
const notificationStore = useNotificationStore();

// Étapes du wizard
const steps = [
  { title: 'Client' },
  { title: 'Template' },
  { title: 'Détails' },
  { title: 'Aperçu' }
];

const currentStep = ref(0);
const isSearching = ref(false);
const clientSearch = ref('');
const clientResults = ref<any[]>([]);
const selectedClient = ref<any>(null);
const templates = ref<any[]>([]);
const selectedTemplate = ref<any>(null);
const showNewClientForm = ref(false);
const contractDetails = ref({
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  price: 0,
  notes: ''
});

const isLoadingTemplates = ref(false);
const templateLoadError = ref(false);

// Récupérer les templates
onMounted(async () => {
  isLoadingTemplates.value = true;
  templateLoadError.value = false;
  
  try {
    templates.value = await contractV2Store.listTemplates();
  } catch (error) {
    templateLoadError.value = true;
    notificationStore.error('Erreur lors du chargement des templates', 'Veuillez réessayer dans quelques instants');
    console.error('Erreur détaillée lors du chargement des templates:', error);
  } finally {
    isLoadingTemplates.value = false;
  }
  
  // Si des données de formulaire sont fournies, les utiliser
  if (props.formData) {
    if (props.formData.clientId) {
      try {
        const client = await clientStore.getClientById(props.formData.clientId);
        selectedClient.value = client;
      } catch (error) {
        console.error('Erreur lors de la récupération du client:', error);
      }
    }
    
    if (props.formData.templateId) {
      try {
        const template = await contractV2Store.getTemplateById(props.formData.templateId);
        selectedTemplate.value = template;
        contractDetails.value.price = template.price;
      } catch (error) {
        console.error('Erreur lors de la récupération du template:', error);
      }
    }
    
    if (props.formData.startDate) {
      contractDetails.value.startDate = props.formData.startDate;
    }
    
    if (props.formData.endDate) {
      contractDetails.value.endDate = props.formData.endDate;
    }
    
    if (props.formData.price) {
      contractDetails.value.price = props.formData.price;
    }
    
    if (props.formData.notes) {
      contractDetails.value.notes = props.formData.notes;
    }
    
    // Si toutes les données sont présentes, avancer à l'étape correspondante
    if (selectedClient.value && selectedTemplate.value) {
      currentStep.value = 2;
    } else if (selectedClient.value) {
      currentStep.value = 1;
    }
  }
});

// Rechercher des clients
async function searchClients() {
  if (clientSearch.value.length < 2) {
    clientResults.value = [];
    return;
  }
  
  isSearching.value = true;
  try {
    clientResults.value = await clientStore.searchClients(clientSearch.value);
  } catch (error) {
    notificationStore.error('Erreur lors de la recherche des clients');
    console.error('Erreur lors de la recherche des clients:', error);
  } finally {
    isSearching.value = false;
  }
}

// Sélectionner un client
function selectClient(client: any) {
  selectedClient.value = client;
  clientResults.value = [];
  clientSearch.value = '';
}

// Sélectionner un template
function selectTemplate(template: any) {
  selectedTemplate.value = template;
  contractDetails.value.price = template.price;
}

// Vérifier si on peut passer à l'étape suivante
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return !!selectedClient.value;
  } else if (currentStep.value === 1) {
    return !!selectedTemplate.value;
  } else if (currentStep.value === 2) {
    return !!contractDetails.value.startDate && 
           !!contractDetails.value.endDate && 
           contractDetails.value.price > 0;
  }
  return true;
});

// Passer à l'étape suivante
function nextStep() {
  if (!canProceed.value) return;
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
}

// Revenir à l'étape précédente
function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

// Annuler la création du contrat
function cancel() {
  emit('cancelled');
}

// Enregistrer le contrat
async function saveContract() {
  try {
    const contractData = {
      clientId: selectedClient.value.id,
      templateId: selectedTemplate.value.id,
      startDate: contractDetails.value.startDate,
      endDate: contractDetails.value.endDate,
      price: contractDetails.value.price,
      notes: contractDetails.value.notes
    };
    
    await contractV2Store.createContract(contractData);
    notificationStore.success('Contrat créé avec succès');
    emit('completed', contractData);
  } catch (error) {
    notificationStore.error('Erreur lors de la création du contrat');
    console.error('Erreur lors de la création du contrat:', error);
  }
}

// Rendu du contrat avec les variables remplacées
const renderedContract = computed(() => {
  if (!selectedTemplate.value || !selectedClient.value) return '';
  
  let content = selectedTemplate.value.bodyMd;
  
  // Remplacer les variables du client
  content = content.replace(/{CLIENT_NOM}/g, selectedClient.value.nom || '');
  content = content.replace(/{CLIENT_PRENOM}/g, selectedClient.value.prenom || '');
  content = content.replace(/{CLIENT_EMAIL}/g, selectedClient.value.email || '');
  content = content.replace(/{CLIENT_TELEPHONE}/g, selectedClient.value.telephone || '');
  content = content.replace(/{CLIENT_ADRESSE}/g, selectedClient.value.adresse || '');
  
  // Remplacer les variables du contrat
  content = content.replace(/{CONTRAT_DATE_DEBUT}/g, formatDate(contractDetails.value.startDate));
  content = content.replace(/{CONTRAT_DATE_FIN}/g, formatDate(contractDetails.value.endDate));
  content = content.replace(/{CONTRAT_PRIX}/g, contractDetails.value.price.toString());
  content = content.replace(/{CONTRAT_PERIODICITE}/g, selectedTemplate.value.periodicity);
  
  // Convertir le markdown en HTML
  return marked(content);
});

// Formater une date
function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Charger les templates
async function loadTemplates() {
  isLoadingTemplates.value = true;
  templateLoadError.value = false;
  
  try {
    templates.value = await contractV2Store.listTemplates();
  } catch (error) {
    templateLoadError.value = true;
    notificationStore.error('Erreur lors du chargement des templates', 'Veuillez réessayer dans quelques instants');
    console.error('Erreur détaillée lors du chargement des templates:', error);
  } finally {
    isLoadingTemplates.value = false;
  }
}
</script>

<style scoped>
.step-content {
  min-height: 300px;
}

:deep(.prose) {
  font-size: 0.9rem;
  line-height: 1.5;
}

:deep(.prose h1) {
  font-size: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

:deep(.prose h2) {
  font-size: 1.25rem;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
}

:deep(.prose p) {
  margin-bottom: 0.75rem;
}
</style>
