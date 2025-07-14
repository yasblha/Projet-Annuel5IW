<template>
  <div class="signature-page">
    <div class="container py-5">
      <div v-if="loading" class="text-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3">Chargement du contrat...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        <h4 class="alert-heading">Erreur!</h4>
        <p>{{ error }}</p>
        <hr>
        <p class="mb-0">Veuillez vérifier le lien que vous avez reçu ou contacter le service client.</p>
      </div>
      
      <div v-else-if="tokenExpired" class="alert alert-warning">
        <h4 class="alert-heading">Lien expiré</h4>
        <p>Ce lien d'invitation à signer a expiré.</p>
        <hr>
        <p class="mb-0">Veuillez demander au propriétaire du contrat de vous envoyer une nouvelle invitation.</p>
      </div>
      
      <div v-else-if="signatureComplete" class="alert alert-success">
        <h4 class="alert-heading">Signature complétée!</h4>
        <p>Vous avez signé ce contrat avec succès.</p>
        <hr>
        <p class="mb-0">Un email de confirmation vous sera envoyé prochainement.</p>
      </div>
      
      <div v-else class="card shadow-sm">
        <div class="card-header bg-white">
          <h2 class="h4 mb-0">Signature de contrat</h2>
        </div>
        <div class="card-body">
          <div class="mb-4">
            <h5 class="mb-3">Détails du contrat</h5>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="detail-item">
                  <span class="detail-label">Numéro du contrat:</span>
                  <span class="detail-value">{{ contract.numero }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-item">
                  <span class="detail-label">Date de début:</span>
                  <span class="detail-value">{{ formatDate(contract.dateDebut) }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-item">
                  <span class="detail-label">Type de contrat:</span>
                  <span class="detail-value">{{ getContractTypeLabel(contract.typeContrat) }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-item">
                  <span class="detail-label">Statut:</span>
                  <span class="detail-value">{{ contract.statut }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <h5 class="mb-3">Propriétaire principal</h5>
            <div class="detail-item">
              <span class="detail-value">{{ ownerName }}</span>
            </div>
          </div>
          
          <div class="mb-4">
            <h5 class="mb-3">Votre signature</h5>
            <div v-if="cosignataire">
              <p>Vous êtes invité à signer ce contrat en tant que {{ cosignataire.roleType === 'PRINCIPAL' ? 'cosignataire principal' : 'cosignataire secondaire' }}.</p>
              
              <div class="signature-area mb-3">
                <div v-if="!signatureData" class="signature-canvas-container">
                  <canvas 
                    ref="signatureCanvas" 
                    width="600" 
                    height="200" 
                    class="signature-canvas border"
                  ></canvas>
                  <div class="signature-actions mt-2 d-flex justify-content-end">
                    <button class="btn btn-sm btn-outline-secondary me-2" @click="clearSignature">
                      Effacer
                    </button>
                  </div>
                </div>
                <div v-else class="signature-preview">
                  <img :src="signatureData" alt="Votre signature" class="img-fluid border" />
                  <div class="signature-actions mt-2 d-flex justify-content-end">
                    <button class="btn btn-sm btn-outline-secondary" @click="clearSignature">
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" v-model="termsAccepted" id="termsCheckbox">
                <label class="form-check-label" for="termsCheckbox">
                  J'ai lu et j'accepte les conditions générales de ce contrat
                </label>
              </div>
              
              <div class="d-flex justify-content-between">
                <button 
                  class="btn btn-danger" 
                  @click="refuseSignature"
                  :disabled="signing"
                >
                  <i class="fas fa-times me-1"></i> Refuser de signer
                </button>
                <button 
                  class="btn btn-primary" 
                  @click="submitSignature"
                  :disabled="!signatureData || !termsAccepted || signing"
                >
                  <i class="fas fa-signature me-1"></i> Signer le contrat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/http.interceptor';

// Références et états
const route = useRoute();
const router = useRouter();
const signatureCanvas = ref<HTMLCanvasElement | null>(null);
let signatureCtx: CanvasRenderingContext2D | null = null;
const signatureData = ref<string | null>(null);
const termsAccepted = ref(false);
const contract = reactive<any>({});
const cosignataire = reactive<any>({});
const loading = ref(true);
const error = ref('');
const signing = ref(false);
const signatureComplete = ref(false);
const tokenExpired = ref(false);
const ownerName = ref('');

// Token de la signature à partir de l'URL
const token = computed(() => route.params.token as string);

// Initialisation du canvas de signature
const initSignatureCanvas = () => {
  const canvas = signatureCanvas.value;
  if (!canvas) return;
  
  signatureCtx = canvas.getContext('2d');
  if (!signatureCtx) return;
  
  signatureCtx.lineWidth = 2;
  signatureCtx.lineCap = 'round';
  signatureCtx.strokeStyle = '#000000';
  
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || !signatureCtx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    signatureCtx.beginPath();
    signatureCtx.moveTo(lastX, lastY);
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
    
    lastX = x;
    lastY = y;
  });
  
  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    saveSignature();
  });
  
  canvas.addEventListener('mouseleave', () => {
    if (isDrawing) {
      isDrawing = false;
      saveSignature();
    }
  });
  
  // Support tactile
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
    isDrawing = true;
  });
  
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing || !signatureCtx) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    signatureCtx.beginPath();
    signatureCtx.moveTo(lastX, lastY);
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
    
    lastX = x;
    lastY = y;
  });
  
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDrawing = false;
    saveSignature();
  });
};

// Sauvegarder la signature en base64
const saveSignature = () => {
  if (signatureCanvas.value) {
    signatureData.value = signatureCanvas.value.toDataURL('image/png');
  }
};

// Effacer la signature
const clearSignature = () => {
  if (signatureCtx && signatureCanvas.value) {
    signatureCtx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
    signatureData.value = null;
  }
};

// Soumettre la signature
const submitSignature = async () => {
  if (!signatureData.value || !termsAccepted.value) return;
  
  signing.value = true;
  try {
    await apiClient.post(`/contrats/signature`, {
      token: token.value,
      signatureData: signatureData.value,
      action: 'SIGN'
    });
    
    signatureComplete.value = true;
  } catch (err: any) {
    error.value = `Erreur lors de la signature: ${err.message}`;
  } finally {
    signing.value = false;
  }
};

// Refuser de signer
const refuseSignature = async () => {
  signing.value = true;
  try {
    await apiClient.post(`/contrats/signature`, {
      token: token.value,
      action: 'REFUSE'
    });
    
    signatureComplete.value = true;
  } catch (err: any) {
    error.value = `Erreur lors du refus de signature: ${err.message}`;
  } finally {
    signing.value = false;
  }
};

// Formater la date
const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR');
};

// Obtenir le libellé du type de contrat
const getContractTypeLabel = (type: string) => {
  const types: {[key: string]: string} = {
    'I': 'Individuel',
    'P': 'Particulier',
    'C': 'Collectivité',
    'A': 'Administration'
  };
  return types[type] || 'Standard';
};

// Au chargement du composant
onMounted(async () => {
  if (!token.value) {
    error.value = 'Lien de signature invalide';
    loading.value = false;
    return;
  }
  
  try {
    // Vérifier et décoder le token
    const response = await apiClient.get(`/contrats/signature/validate/${token.value}`);
    const { contract: contractData, cosignataire: cosigData, owner } = response.data;
    
    // Remplir les données
    Object.assign(contract, contractData);
    Object.assign(cosignataire, cosigData);
    ownerName.value = owner?.nom || owner?.raisonSociale || 'Propriétaire principal';
    
    // Initialiser le canvas de signature
    setTimeout(() => {
      initSignatureCanvas();
    }, 100);
    
  } catch (err: any) {
    if (err.response?.status === 410) {
      tokenExpired.value = true;
    } else {
      error.value = `Erreur de chargement: ${err.message}`;
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.signature-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.detail-item {
  margin-bottom: 0.5rem;
}

.detail-label {
  font-weight: 500;
  margin-right: 0.5rem;
  color: #6c757d;
}

.detail-value {
  font-weight: 600;
}

.signature-canvas-container {
  width: 100%;
}

.signature-canvas {
  background-color: #fff;
  width: 100%;
  cursor: crosshair;
}

@media (max-width: 768px) {
  .signature-canvas {
    height: 150px;
  }
}
</style>
