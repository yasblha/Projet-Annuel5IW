<template>
  <div class="cosignataires-card">
    <div class="card p-4 bg-white rounded shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center p-0 mb-3 border-0 bg-transparent">
        <h5 class="mb-0">Cosignataires</h5>
        <button 
          v-if="cosignataires && cosignataires.length > 0" 
          class="btn btn-primary btn-sm"
          @click="sendAllInvitations"
          :disabled="sending"
        >
          <i class="fas fa-envelope me-1"></i> Envoyer toutes les invitations
        </button>
      </div>
      
      <div v-if="loading" class="text-center p-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
      
      <div v-else-if="!cosignataires || cosignataires.length === 0" class="text-center p-3">
        <p class="text-muted">Aucun cosignataire n'a été ajouté à ce contrat.</p>
      </div>
      
      <div v-else>
        <div v-for="(cosignataire, index) in cosignataires" :key="index" class="cosignataire-item p-3 mb-2 border rounded">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="d-flex align-items-center">
                <div class="avatar me-2">
                  <i class="fas fa-user-circle fa-2x text-secondary"></i>
                </div>
                <div>
                  <h6 class="mb-0">{{ cosignataire.nomCosignataire || cosignataire.emailCosignataire }}</h6>
                  <div class="text-muted small">
                    <span class="me-2">{{ cosignataire.emailCosignataire }}</span>
                    <span v-if="cosignataire.telephoneCosignataire" class="me-2">
                      <i class="fas fa-phone-alt me-1"></i>{{ cosignataire.telephoneCosignataire }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="d-flex align-items-center">
              <div class="me-3">
                <span 
                  :class="getStatusBadgeClass(cosignataire.statutSignature, cosignataire.statutInvitation)"
                  class="badge"
                >
                  {{ getStatusLabel(cosignataire.statutSignature, cosignataire.statutInvitation) }}
                </span>
              </div>
              <button 
                class="btn btn-outline-primary btn-sm" 
                @click="sendInvitation(cosignataire)"
                :disabled="sending || cosignataire.statutSignature === 'SIGNE'"
              >
                <i class="fas fa-paper-plane me-1"></i>
                {{ getInviteButtonText(cosignataire) }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="error" class="alert alert-danger mt-3">
        {{ error }}
      </div>
      
      <div v-if="successMessage" class="alert alert-success mt-3">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useContractStore } from '@/stores/contract.store';

const props = defineProps({
  contractId: {
    type: String,
    required: true
  }
});

const contractStore = useContractStore();
const cosignataires = ref<any[]>([]);
const loading = ref(false);
const sending = ref(false);
const error = ref('');
const successMessage = ref('');

// Charger les cosignataires au montage du composant
onMounted(async () => {
  await loadCosignataires();
});

// Fonction pour charger les cosignataires
const loadCosignataires = async () => {
  loading.value = true;
  error.value = '';
  try {
    const result = await contractStore.getCosignataires(props.contractId);
    cosignataires.value = result;
  } catch (err: any) {
    error.value = `Erreur lors du chargement des cosignataires: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

// Fonction pour envoyer une invitation à un cosignataire
const sendInvitation = async (cosignataire: any) => {
  sending.value = true;
  error.value = '';
  successMessage.value = '';
  try {
    await contractStore.sendSignatureInvitation(
      props.contractId,
      cosignataire.id,
      window.location.origin
    );
    
    successMessage.value = `Invitation envoyée à ${cosignataire.emailCosignataire}`;
    // Actualiser les cosignataires pour mettre à jour leur statut
    await loadCosignataires();
  } catch (err: any) {
    error.value = `Erreur lors de l'envoi de l'invitation: ${err.message}`;
  } finally {
    sending.value = false;
  }
};

// Fonction pour envoyer des invitations à tous les cosignataires
const sendAllInvitations = async () => {
  sending.value = true;
  error.value = '';
  successMessage.value = '';
  try {
    const result = await contractStore.sendAllSignatureInvitations(
      props.contractId,
      window.location.origin
    );
    
    successMessage.value = `${result.results.filter((r: any) => r.success).length} invitation(s) envoyée(s)`;
    // Actualiser les cosignataires pour mettre à jour leur statut
    await loadCosignataires();
  } catch (err: any) {
    error.value = `Erreur lors de l'envoi des invitations: ${err.message}`;
  } finally {
    sending.value = false;
  }
};

// Fonctions auxiliaires pour afficher le statut et les classes CSS
const getStatusBadgeClass = (statutSignature: string, statutInvitation: string) => {
  if (statutSignature === 'SIGNE') return 'bg-success';
  if (statutSignature === 'REFUSE') return 'bg-danger';
  if (statutInvitation === 'ENVOYE') return 'bg-warning text-dark';
  return 'bg-secondary';
};

const getStatusLabel = (statutSignature: string, statutInvitation: string) => {
  if (statutSignature === 'SIGNE') return 'Signé';
  if (statutSignature === 'REFUSE') return 'Refusé';
  if (statutInvitation === 'ENVOYE') return 'Invitation envoyée';
  if (statutInvitation === 'NON_ENVOYE') return 'En attente d\'invitation';
  return 'En attente';
};

const getInviteButtonText = (cosignataire: any) => {
  if (cosignataire.statutSignature === 'SIGNE') return 'Signé';
  if (cosignataire.statutInvitation === 'ENVOYE') return 'Renvoyer';
  return 'Inviter';
};
</script>

<style scoped>
.cosignataires-card {
  margin-bottom: 20px;
}

.cosignataire-item {
  transition: all 0.2s ease;
  background-color: #f8f9fa;
}

.cosignataire-item:hover {
  background-color: #f1f3f5;
}

.avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
