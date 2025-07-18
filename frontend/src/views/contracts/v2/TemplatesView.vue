<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-extrabold mb-6 text-blue-800 flex items-center gap-2">
        <i class="fas fa-file-alt"></i> Gestion des templates de contrat
      </h1>
      
      <!-- Actions -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex gap-4">
          <button 
            @click="showCreateModal = true" 
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <i class="fas fa-plus"></i> Nouveau template
          </button>
        </div>
        <div class="flex gap-2">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Rechercher un template..." 
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <!-- Liste des templates -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div v-if="isLoading" class="flex justify-center items-center p-8">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        
        <div v-else-if="templates.length === 0" class="p-8 text-center text-gray-500">
          <i class="fas fa-file-alt text-4xl mb-2"></i>
          <p>Aucun template de contrat disponible.</p>
          <button 
            @click="showCreateModal = true" 
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Créer un template
          </button>
        </div>
        
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Périodicité</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="template in filteredTemplates" :key="template.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ template.name }}</div>
                <div class="text-xs text-gray-500 truncate max-w-xs" :title="template.bodyMd">
                  {{ (template.bodyMd || '').replace(/\\n/g, ' ').slice(0, 60) }}{{ template.bodyMd && template.bodyMd.length > 60 ? '…' : '' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatPeriodicity(template.periodicity) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatPrice(template.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatDate(template.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button 
                  @click="viewTemplate(template)" 
                  class="text-gray-600 hover:text-gray-900"
                  title="Voir"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  @click="editTemplate(template)" 
                  class="text-blue-600 hover:text-blue-900"
                  title="Éditer"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="confirmDelete(template)" 
                  class="text-red-600 hover:text-red-900"
                  title="Supprimer"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal de création/édition -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModals"></div>
      
      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-3xl z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ showEditModal ? 'Modifier le template' : 'Créer un nouveau template' }}
          </h3>
          <button @click="closeModals" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Body -->
        <div class="px-6 py-4">
          <form @submit.prevent="submitForm">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom du template</label>
              <input 
                type="text" 
                v-model="formData.name" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Périodicité</label>
                <select 
                  v-model="formData.periodicity" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MENSUEL">Mensuel</option>
                  <option value="TRIMESTRIEL">Trimestriel</option>
                  <option value="SEMESTRIEL">Semestriel</option>
                  <option value="ANNUEL">Annuel</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                <input 
                  type="number" 
                  v-model="formData.price" 
                  required
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Contenu du template (Markdown)</label>
              <textarea 
                v-model="formData.bodyMd" 
                required
                rows="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="# Titre du contrat&#10;&#10;Ce contrat est conclu entre **{CLIENT_NOM}** et notre société...&#10;&#10;## Article 1: Objet du contrat&#10;&#10;Le présent contrat a pour objet..."
              ></textarea>
              <p class="mt-1 text-sm text-gray-500">
                Vous pouvez utiliser des variables comme {CLIENT_NOM}, {CLIENT_PRENOM}, {DATE_DEBUT}, {DATE_FIN}, {PRIX}, etc.
              </p>
            </div>
            
            <div class="flex justify-end gap-2">
              <button 
                type="button"
                @click="closeModals" 
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="flex items-center gap-2">
                  <i class="fas fa-spinner fa-spin"></i> Enregistrement...
                </span>
                <span v-else>
                  {{ showEditModal ? 'Mettre à jour' : 'Créer' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity" @click="showDeleteModal = false"></div>
      
      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-sm z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Confirmation de suppression</h3>
          <button @click="showDeleteModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Body -->
        <div class="px-6 py-6">
          <p class="text-gray-700">Êtes-vous sûr de vouloir supprimer ce template de contrat ? Cette action est irréversible.</p>
          <p class="mt-2 text-sm text-red-600">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            Attention : La suppression d'un template n'affectera pas les contrats existants créés à partir de ce template.
          </p>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end gap-2 px-6 pb-6">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none"
          >
            Annuler
          </button>
          <button
            @click="deleteTemplate"
            class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <i class="fas fa-spinner fa-spin"></i> Suppression...
            </span>
            <span v-else>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal Détails Template -->
    <div v-if="showDetailsModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="showDetailsModal = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-4xl z-10 p-6 overflow-y-auto max-h-[90vh]">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i class="fas fa-file-alt text-blue-600"></i>{{ selectedTemplate?.name }}
          </h3>
          <button @click="showDetailsModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-500">Périodicité</p>
            <p class="font-medium">{{ formatPeriodicity(selectedTemplate?.periodicity || '') }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Prix</p>
            <p class="font-medium">{{ formatPrice(selectedTemplate?.price || 0) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Créé le</p>
            <p class="font-medium">{{ formatDate(selectedTemplate?.createdAt || '') }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Identifiant</p>
            <p class="font-mono break-all text-xs">{{ selectedTemplate?.id }}</p>
          </div>
        </div>
        <hr class="my-4" />
        <div>
          <h4 class="text-lg font-semibold mb-2">Contenu du contrat (Markdown)</h4>
          <div class="prose max-w-none" v-html="renderedMarkdown"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useContractV2Store } from '@/stores/contract-v2.store';
import { useNotificationStore } from '@/stores/notification.store';
import type { TemplateV2 } from '@/services/api/contract-v2.service';
import { marked } from 'marked';

// Stores
const contractV2Store = useContractV2Store();
const notificationStore = useNotificationStore();

// État local
const templates = ref<TemplateV2[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const searchQuery = ref('');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showDetailsModal = ref(false);
const selectedTemplate = ref<TemplateV2 | null>(null);

// Formulaire
const formData = ref({
  id: '',
  name: '',
  bodyMd: '',
  periodicity: 'MENSUEL',
  price: 0
});

// Templates filtrés par la recherche
const filteredTemplates = computed(() => {
  if (!searchQuery.value) return templates.value;
  
  const query = searchQuery.value.toLowerCase();
  return templates.value.filter(template => 
    template.name.toLowerCase().includes(query)
  );
});

// Récupération des templates
const fetchTemplates = async () => {
  isLoading.value = true;
  try {
    await contractV2Store.listTemplates();
    templates.value = contractV2Store.getTemplates;
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    notificationStore.error('Erreur', 'Impossible de récupérer la liste des templates');
  } finally {
    isLoading.value = false;
  }
};

// Édition d'un template
const editTemplate = (template: TemplateV2) => {
  selectedTemplate.value = template;
  formData.value = {
    id: template.id,
    name: template.name,
    bodyMd: template.bodyMd,
    periodicity: template.periodicity,
    price: template.price
  };
  showEditModal.value = true;
};

// Voir détails
const viewTemplate = (template: TemplateV2) => {
  selectedTemplate.value = template;
  showDetailsModal.value = true;
};

// Confirmation de suppression
const confirmDelete = (template: TemplateV2) => {
  selectedTemplate.value = template;
  showDeleteModal.value = true;
};

// Suppression d'un template
const deleteTemplate = async () => {
  if (!selectedTemplate.value) return;
  
  isSubmitting.value = true;
  try {
    await contractV2Store.deleteTemplate(selectedTemplate.value.id);
    notificationStore.success('Succès', 'Le template a été supprimé avec succès');
    showDeleteModal.value = false;
    selectedTemplate.value = null;
    fetchTemplates();
  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error);
    notificationStore.error('Erreur', 'Impossible de supprimer le template');
  } finally {
    isSubmitting.value = false;
  }
};

// Soumission du formulaire (création ou mise à jour)
const submitForm = async () => {
  isSubmitting.value = true;
  try {
    if (showEditModal.value && selectedTemplate.value) {
      // Mise à jour
      await contractV2Store.updateTemplate(selectedTemplate.value.id, {
        name: formData.value.name,
        bodyMd: formData.value.bodyMd,
        periodicity: formData.value.periodicity,
        price: formData.value.price
      });
      notificationStore.success('Succès', 'Le template a été mis à jour avec succès');
    } else {
      // Création
      await contractV2Store.createTemplate({
        name: formData.value.name,
        bodyMd: formData.value.bodyMd,
        periodicity: formData.value.periodicity,
        price: formData.value.price
      });
      notificationStore.success('Succès', 'Le template a été créé avec succès');
    }
    closeModals();
    fetchTemplates();
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du template:', error);
    notificationStore.error('Erreur', 'Impossible d\'enregistrer le template');
  } finally {
    isSubmitting.value = false;
  }
};

// Fermeture des modals
const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  showDetailsModal.value = false;
  selectedTemplate.value = null;
  formData.value = {
    id: '',
    name: '',
    bodyMd: '',
    periodicity: 'MENSUEL',
    price: 0
  };
};

// Fonction de formatage de date
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

// Helpers de formatage
function formatPrice(price: number) {
  return price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}
function formatPeriodicity(code: string) {
  const map: Record<string,string> = { 'MENSUEL': 'Mensuel', 'ANNUEL': 'Annuel', 'TRIMESTRIEL': 'Trimestriel' };
  return map[code] || code;
}

const renderedMarkdown = computed(() => {
  if (!selectedTemplate.value) return '';
  return marked(selectedTemplate.value.bodyMd || '');
});

// Initialisation
onMounted(() => {
  fetchTemplates();
});
</script>
