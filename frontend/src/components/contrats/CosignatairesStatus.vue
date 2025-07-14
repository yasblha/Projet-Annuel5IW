<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">État des signatures</h3>
      <button 
        @click="refreshData"
        :disabled="loading"
        class="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        title="Actualiser"
      >
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
      </button>
    </div>
    
    <div v-if="loading && !hasLoaded" class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <i class="fas fa-exclamation-circle text-red-400 mt-0.5"></i>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
          <button 
            @click="loadCosignataires()"
            class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
    
    <div v-else-if="hasLoaded && cosignataires.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
      <i class="fas fa-users text-3xl text-gray-400 mb-3"></i>
      <p class="text-sm text-gray-500">Aucun cosignataire pour ce contrat</p>
      <div class="mt-4">
        <button
          v-if="authStore.isAuthenticated"
          @click="signContractAsCurrentUser"
          :disabled="signingContract"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          <i class="fas fa-signature mr-2" :class="{ 'fa-spin': signingContract }"></i>
          {{ signingContract ? 'Signature en cours...' : 'Signer le contrat' }}
        </button>
      </div>
    </div>
    
    <div v-else-if="cosignataires.length > 0" class="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200">
        <li v-for="cosignataire in cosignataires" :key="cosignataire.id" class="px-4 py-4 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                  {{ getInitials(cosignataire.nom, cosignataire.prenom) }}
                </div>
              </div>
              <div class="ml-4">
                <div class="font-medium text-gray-900">
                  {{ cosignataire.prenom }} {{ cosignataire.nom }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ cosignataire.email }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ cosignataire.role || 'Cosignataire' }}
                </div>
              </div>
            </div>
            
            <div class="flex flex-col items-end">
              <SignatureStatusBadge :status="cosignataire.signatureStatus || 'PENDING'" />
              
              <div v-if="cosignataire.invitationSentDate" class="text-xs text-gray-500 mt-1">
                Invitation envoyée le {{ formatDate(cosignataire.invitationSentDate) }}
              </div>
              
              <div v-if="cosignataire.signatureDate" class="text-xs text-gray-500 mt-1">
                Signé le {{ formatDate(cosignataire.signatureDate) }}
              </div>
              
              <button 
                v-if="cosignataire.signatureStatus === 'PENDING' && !cosignataire.invitationSentDate"
                @click="sendInvitation(cosignataire.id)"
                :disabled="sendingInvitation === cosignataire.id"
                class="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <i class="fas fa-envelope mr-1" :class="{ 'fa-spin': sendingInvitation === cosignataire.id }"></i> 
                {{ sendingInvitation === cosignataire.id ? 'Envoi...' : 'Envoyer l\'invitation' }}
              </button>
              
              <button 
                v-else-if="cosignataire.signatureStatus === 'PENDING' && cosignataire.invitationSentDate"
                @click="sendInvitation(cosignataire.id)"
                :disabled="sendingInvitation === cosignataire.id"
                class="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <i class="fas fa-paper-plane mr-1" :class="{ 'fa-spin': sendingInvitation === cosignataire.id }"></i> 
                {{ sendingInvitation === cosignataire.id ? 'Envoi...' : 'Renvoyer l\'invitation' }}
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
    
    <div class="flex justify-end mt-4" v-if="cosignataires.length > 0">
      <button 
        @click="sendAllInvitations"
        :disabled="sendingAllInvitations"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <i class="fas fa-paper-plane mr-1" :class="{ 'fa-spin': sendingAllInvitations }"></i> 
        {{ sendingAllInvitations ? 'Envoi en cours...' : 'Inviter tous les cosignataires' }}
      </button>
      <button
        v-if="authStore.isAuthenticated && cosignataires.length > 0"
        @click="signContractAsCurrentUser"
        :disabled="signingContract"
        class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        <i class="fas fa-signature mr-2" :class="{ 'fa-spin': signingContract }"></i>
        {{ signingContract ? 'Signature en cours...' : 'Signer le contrat' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useNotificationStore } from '@/stores/notification.store';
import { useContractStore } from '@/stores/contract.store';
import { useAuthStore } from '@/stores/auth.store';
import type { Cosignatary } from '@/types/contract.types';
import SignatureStatusBadge from './SignatureStatusBadge.vue';
import { contractApi } from '@/services/api/contract.service';

const props = defineProps<{
  contratId?: string;
}>();

// Stores pour les notifications seulement
const notificationStore = useNotificationStore();
const contractStore = useContractStore();
const authStore = useAuthStore();

// State local pour éviter les problèmes de réactivité
const loading = ref(false);
const error = ref<string | null>(null);
const cosignataires = ref<Cosignatary[]>([]);
const hasLoaded = ref(false);
const sendingInvitation = ref<string | null>(null);
const sendingAllInvitations = ref(false);
const signingContract = ref(false);

// Fonction pour obtenir les initiales
const getInitials = (nom?: string, prenom?: string): string => {
  const n = nom ? nom.charAt(0) : '';
  const p = prenom ? prenom.charAt(0) : '';
  return (p + n).toUpperCase();
};

// Formatter les dates
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Charger les cosignataires directement via l'API
const loadCosignataires = async (force = false) => {
  // Éviter de recharger si déjà en cours de chargement
  if (loading.value) {
    console.log('Chargement déjà en cours, ignoré');
    return;
  }
  
  // Ne pas recharger si on a déjà des données et que ce n'est pas forcé
  if (!force && hasLoaded.value) {
    console.log('Utilisation des données en cache');
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Chargement direct des cosignataires pour le contrat:', props.contratId);
    // Appel direct à l'API sans passer par le store
    const res = await contractApi.getCosignataires(props.contratId);
    console.log('Réponse API cosignataires:', res);
    cosignataires.value = Array.isArray(res) ? res : [];
    hasLoaded.value = true;
  } catch (err: any) {
    console.error('Erreur lors du chargement des cosignataires', err);
    error.value = err?.message || 'Erreur lors du chargement des cosignataires';
    cosignataires.value = [];
  } finally {
    loading.value = false;
  }
};

// Actualiser les données
const refreshData = async () => {
  await loadCosignataires(true);
};

// Envoyer une invitation à un cosignataire
const sendInvitation = async (cosignataireId: string) => {
  if (sendingInvitation.value) return;
  
  sendingInvitation.value = cosignataireId;
  try {
    const baseUrl = `${window.location.origin}/signature`;
    // Appel API direct
    await contractApi.sendSignatureInvitation(props.contratId, cosignataireId, baseUrl);
    
    // Recharger les données après l'envoi
    await loadCosignataires(true);
    
    notificationStore.success('Invitation envoyée', 'L\'invitation a été envoyée avec succès');
  } catch (err: any) {
    console.error('Erreur lors de l\'envoi de l\'invitation', err);
    notificationStore.error('Erreur', err?.message || 'Impossible d\'envoyer l\'invitation');
  } finally {
    sendingInvitation.value = null;
  }
};

// Envoyer des invitations à tous les cosignataires
const sendAllInvitations = async () => {
  if (sendingAllInvitations.value) return;
  
  sendingAllInvitations.value = true;
  try {
    const baseUrl = `${window.location.origin}/signature`;
    // Appel API direct
    await contractApi.sendAllSignatureInvitations(props.contratId, baseUrl);
    
    // Recharger les données après l'envoi
    await loadCosignataires(true);
    
    notificationStore.success('Invitations envoyées', 'Toutes les invitations ont été envoyées avec succès');
  } catch (err: any) {
    console.error('Erreur lors de l\'envoi des invitations', err);
    notificationStore.error('Erreur', err?.message || 'Impossible d\'envoyer les invitations');
  } finally {
    sendingAllInvitations.value = false;
  }
};

// Signer le contrat en tant qu'utilisateur connecté
const signContractAsCurrentUser = async () => {
  if (!props.contratId || signingContract.value || !authStore.user?.id) return;
  
  signingContract.value = true;
  try {
    // Signer le contrat avec l'utilisateur courant
    await contractStore.signContract(props.contratId, authStore.user.id);
    
    // Notifier l'utilisateur
    notificationStore.success(
      'Contrat signé',
      'Vous avez signé le contrat avec succès'
    );
    
    // Recharger les cosignataires pour voir les changements
    await loadCosignataires();
  } catch (err: any) {
    console.error('Erreur lors de la signature du contrat', err);
    notificationStore.error(
      'Erreur',
      err?.message || 'Impossible de signer le contrat'
    );
  } finally {
    signingContract.value = false;
  }
};

// Charger les cosignataires une seule fois au montage
onMounted(() => {
  console.log('CosignatairesStatus monté, ID contrat:', props.contratId);
  if (props.contratId) {
    loadCosignataires();
  }
});

// Recharger si l'ID du contrat change
watch(() => props.contratId, (newId) => {
  if (newId) {
    console.log('ID contrat changé:', newId);
    cosignataires.value = [];
    hasLoaded.value = false;
    loadCosignataires();
  }
}, { immediate: false });
</script>
