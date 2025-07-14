<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Indicateur de chargement -->
      <div v-if="loading" class="flex justify-center my-12">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
        <span class="ml-3 text-xl text-gray-600">Chargement du contrat...</span>
      </div>
      
      <!-- Message d'erreur -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 my-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-circle text-red-400"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Détails du contrat -->
      <div v-else-if="contract" class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- En-tête avec numéro et statut -->
        <div class="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between border-b border-gray-200">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Contrat #{{ contract.numero }}</h1>
            <p class="mt-1 text-sm text-gray-600">
              Créé le {{ formatDate(contract.dateCreation) }}
            </p>
          </div>
          <div class="flex items-center gap-3 mt-2 sm:mt-0">
            <span :class="statusClasses" class="px-3 py-1 rounded-full text-xs font-medium">
              {{ statusText }}
            </span>
            <button 
              @click="goBack"
              class="text-gray-600 hover:text-gray-900"
              title="Retour"
            >
              <i class="fas fa-chevron-left"></i> Retour
            </button>
          </div>
        </div>
        
        <!-- Boutons d'action -->
        <div class="bg-blue-50 px-6 py-3">
          <div class="flex flex-wrap gap-2 justify-end">
            <!-- Bouton Résilier - disponible pour les contrats actifs et en attente -->
            <button 
              v-if="['ACTIF', 'EN_ATTENTE'].includes(contract.statut)"
              @click="showTerminateModal = true"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <i class="fas fa-times-circle mr-2"></i> Résilier
            </button>

            <!-- Boutons pour les contrats en attente de signature -->
            <button 
              v-if="['EN_ATTENTE', 'PENDING'].includes(contract.statut)"
              @click="signContract"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <i class="fas fa-signature mr-2"></i> Signer le contrat
            </button>
            <button 
              v-if="!contract.isSigned && contract.statutSignature !== 'COMPLETE'"
              @click="finalizeContract"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <i class="fas fa-check-circle mr-2"></i> Finaliser le contrat
            </button>
            <button
              v-if="contract.isSigned || ['ACTIF', 'EN_ATTENTE', 'FINALISE'].includes(contract.statut)"
              @click="downloadPDF"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              :disabled="pdfLoading"
            >
              <i :class="[pdfLoading ? 'fa-spinner fa-spin' : 'fa-file-pdf', 'fas mr-2']"></i> 
              {{ pdfLoading ? 'Génération...' : 'Télécharger le PDF' }}
            </button>
          </div>
        </div>
        
        <!-- Onglets de navigation -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="flex -mb-px space-x-8">
            <button
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-4 px-1 border-b-2 font-medium text-sm"
              :class="[
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i :class="tab.icon" class="mr-2"></i>
              {{ tab.name }}
            </button>
          </nav>
        </div>
        
        <!-- Contenu des onglets -->
        <div v-if="activeTab === 'info'" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Informations générales du contrat -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Informations du contrat</h3>
              <button 
                v-if="['EN_ATTENTE', 'PENDING'].includes(contract.statut)"
                @click="showEditModal = true"
                class="text-blue-600 hover:text-blue-800"
              >
                <i class="fas fa-edit"></i>
              </button>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl class="sm:divide-y sm:divide-gray-200">
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Référence</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ contract.numero }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Date de début</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatDate(contract.dateDebut) }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Date de fin</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatDate(contract.dateFin) || 'Non définie' }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Durée</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ contract.dureeEnJours }} jours</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Montant total</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ contract.montantTotal ? formatPrice(contract.montantTotal) : 'Non défini' }}
                  </dd>
                </div>
                <div v-if="contract.dateSignature" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Date de signature</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatDate(contract.dateSignature) }}</dd>
                </div>
                <div v-if="contract.dateResiliation" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Date de résiliation</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ formatDate(contract.dateResiliation) }}</dd>
                </div>
                <div v-if="contract.motifResiliation" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Motif de résiliation</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ contract.motifResiliation }}</dd>
                </div>
                <div v-if="proprietaire" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Propriétaire</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ proprietaire.nom }} {{ proprietaire.prenom }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <!-- Onglet signatures -->
        <div v-else-if="activeTab === 'signatures'" class="p-6">
          <Suspense>
            <CosignatairesStatus :contratId="contractId" />
            <template #fallback>
              <div class="flex justify-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            </template>
          </Suspense>
        </div>

        <!-- Onglet audit -->
        <div v-else-if="activeTab === 'audit'" class="p-6">
          <ContractHistoryTab :contractId="contractId" />
        </div>
        
        <!-- Onglet interventions -->
        <div v-else-if="activeTab === 'interventions'" class="p-6">
          <div class="text-center py-12 bg-gray-50 rounded-lg">
            <i class="fas fa-tools text-4xl text-gray-400 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-700">Fonctionnalité à venir</h3>
            <p class="mt-2 text-gray-500">Le suivi des interventions sera disponible prochainement.</p>
          </div>
        </div>
      </div>

      <!-- Message si pas de contrat -->
      <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
        <i class="fas fa-exclamation-triangle text-4xl text-amber-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-700">Contrat non trouvé</h3>
        <p class="mt-2 text-gray-500">Le contrat demandé n'existe pas ou a été supprimé.</p>
      </div>
    </div>
  </div>
  
  <!-- Modals -->
  <ContractTerminateModal
    v-model="showTerminateModal"
    :contractId="contractId"
    @terminated="handleContractTerminated"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useContractStore } from '@/stores/contract.store';
import { useAuthStore } from '@/stores/auth.store';
import { useClientStore } from '@/stores/client.store';
import { useNotificationStore } from '@/stores/notification.store';
import ContractHistoryTab from '@/components/contrats/ContractHistoryTab.vue';
import CosignatairesStatus from '@/components/contrats/CosignatairesStatus.vue';
import ContractTerminateModal from '@/components/contrats/ContractTerminateModal.vue';
import { contractTemplateService } from '@/services/contract-template.service';

const route = useRoute();
const router = useRouter();
const contractStore = useContractStore();
const authStore = useAuthStore();
const clientStore = useClientStore();
const notificationStore = useNotificationStore();

const contractId = computed(() => route.params.id as string);
// Remplacer computed par ref pour le contract et mise à jour manuelle
const contract = ref(null);
const loading = computed(() => contractStore.isLoading);
const error = computed(() => contractStore.getError);

// Informations du client propriétaire
const proprietaire = ref<any>(null);
const isLoadingProprietaire = ref(false);

const showEditModal = ref(false);
const showSuspendModal = ref(false);
const showTerminateModal = ref(false);
const activeTab = ref('info');
const pdfLoading = ref(false);

// Définition des onglets
const tabs = [
  { id: 'info', name: 'Informations', icon: 'fas fa-info-circle' },
  { id: 'signatures', name: 'Signatures', icon: 'fas fa-signature' },
  { id: 'audit', name: 'Historique', icon: 'fas fa-history' },
  { id: 'interventions', name: 'Interventions', icon: 'fas fa-tools' }
];

// Classes CSS et textes pour l'affichage du statut
const statusClasses = computed(() => {
  if (!contract.value) return '';
  console.log('Contract status:', contract.value.statut);
  
  switch (contract.value.statut) {
    case 'ACTIF':
      return 'bg-green-100 text-green-800';
    case 'EN_ATTENTE':
      return 'bg-gray-100 text-gray-800';
    case 'PENDING':
      return 'bg-blue-100 text-blue-800';
    case 'SUSPENDU':
      return 'bg-amber-100 text-amber-800';
    case 'RESILIE':
      return 'bg-red-100 text-red-800';
    case 'ANNULE':
      return 'bg-red-100 text-red-800';
    case 'EXPIRE':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});

const statusText = computed(() => {
  if (!contract.value) return '';
  
  switch (contract.value.statut) {
    case 'ACTIF':
      return 'Actif';
    case 'EN_ATTENTE':
      return 'En attente';
    case 'PENDING':
      return 'En attente';
    case 'SUSPENDU':
      return 'Suspendu';
    case 'RESILIE':
      return 'Résilié';
    case 'ANNULE':
      return 'Annulé';
    case 'EXPIRE':
      return 'Expiré';
    default:
      return 'Inconnu';
  }
});

// Formater les dates
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Formater les prix
const formatPrice = (price?: number): string => {
  if (price === undefined) return 'Non défini';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

// Fonctions pour les actions sur le contrat
const goBack = () => {
  router.back();
};

const finalizeContract = async () => {
  if (!contractId.value) return;
  
  try {
    await contractStore.finalizeContract(contractId.value);
    notificationStore.success('Contrat finalisé', 'Le contrat a été finalisé avec succès');
  } catch (err) {
    // L'erreur est déjà gérée par le store
  }
};

const signContract = async () => {
  if (!contract.value || !authStore.user?.id) {
    notificationStore.error('Erreur', 'Impossible de signer le contrat. Utilisateur non connecté.');
    return;
  }
  
  try {
    await contractStore.signContract(contractId.value, authStore.user.id);
    notificationStore.success('Succès', 'Contrat signé avec succès');
    // Recharger les données du contrat pour afficher les changements
    await loadContractData();
  } catch (err: any) {
    console.error('Erreur lors de la signature:', err);
    notificationStore.error('Erreur', err?.message || 'Impossible de signer le contrat');
  }
};

const handleContractTerminated = async () => {
  notificationStore.success('Succès', 'Le contrat a été résilié avec succès');
  // Recharger les données du contrat pour refléter les changements
  await loadContractData();
};

// Charger les données du contrat
const loadContractData = async () => {
  if (!contractId.value) {
    console.error('Pas d\'ID de contrat défini');
    return;
  }
  
  console.log('Chargement du contrat avec l\'ID:', contractId.value);
  
  try {
    const data = await contractStore.getContractById(contractId.value);
    console.log('Données du contrat récupérées:', data);
    
    // Mise à jour explicite de contract.value
    contract.value = data;
    
    // Une fois le contrat chargé, on récupère les informations du client propriétaire
    if (data && data.proprietaireId) {
      await loadProprietaireInfo(data.proprietaireId);
    }
  } catch (err) {
    console.error('Erreur lors du chargement du contrat:', err);
    // L'erreur est déjà gérée par le store
  }
};

// Charger les informations du propriétaire avec cache
const loadProprietaireInfo = async (proprietaireId: string) => {
  if (!proprietaireId) return;
  
  // Éviter de recharger si déjà en cours
  if (isLoadingProprietaire.value) return;
  
  isLoadingProprietaire.value = true;
  try {
    // Utiliser directement getClientById pour récupérer le client propriétaire
    const client = await clientStore.getClientById(proprietaireId);
    if (client) {
      proprietaire.value = client;
      console.log('Client propriétaire trouvé:', proprietaire.value);
    }
  } catch (err) {
    console.error('Erreur lors de la récupération du client propriétaire:', err);
    // Si le client n'est pas trouvé, on peut ajouter un fallback
    proprietaire.value = {
      nom: 'Client',
      prenom: 'inconnu'
    };
  } finally {
    isLoadingProprietaire.value = false;
  }
};

// Fonction pour télécharger le PDF du contrat
async function downloadPDF() {
  try {
    pdfLoading.value = true;
    
    if (!contract.value) {
      throw new Error('Aucun contrat à télécharger');
    }
    
    await contractTemplateService.downloadContractPDF(contract.value);
    
    notificationStore.success('Succès', 'Le contrat a été téléchargé avec succès');
  } catch (err: any) {
    console.error('Erreur lors du téléchargement du PDF:', err);
    
    notificationStore.error('Erreur', `Erreur lors du téléchargement du PDF: ${err.message || 'Erreur inconnue'}`);
  } finally {
    pdfLoading.value = false;
  }
}

// IMPORTANT: Maintenant que loadContractData est défini, on peut configurer les watchers
watch(() => contract.value, (newContract) => {
  console.log('Contract data changed:', newContract);
}, { deep: true });

// Charger les données au montage du composant
onMounted(() => {
  console.log('ContractDetailsView monté avec ID:', contractId.value);
  loadContractData();
});

// Nettoyer les données au démontage du composant
onBeforeUnmount(() => {
  contractStore.clearCurrentContract();
});
</script>
