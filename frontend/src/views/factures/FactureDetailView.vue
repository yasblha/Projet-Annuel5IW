<template>
  <div class="facture-detail-container">
    <!-- Header avec actions -->
    <div class="header bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800" v-if="factureActive">
          Facture {{ factureActive.numeroFacture }}
        </h1>
        <div class="flex items-center mt-1">
          <span :class="['status-badge', getStatusClass(factureActive?.statut)]" v-if="factureActive">
            {{ getStatusLabel(factureActive.statut) }}
          </span>
          <span class="text-gray-500 text-sm ml-4" v-if="factureActive">
            <i class="fas fa-calendar-alt mr-1"></i> Émise le {{ formatDate(factureActive.dateEmission) }}
          </span>
          <span class="text-gray-500 text-sm ml-4" v-if="factureActive">
            <i class="fas fa-hourglass-end mr-1"></i> Échéance le {{ formatDate(factureActive.dateEcheance) }}
          </span>
        </div>
      </div>
      <div class="flex space-x-2">
        <button @click="goBack" class="btn btn-outline">
          <i class="fas fa-arrow-left mr-2"></i>Retour
        </button>
        <button @click="downloadPDF" class="btn btn-outline">
          <i class="fas fa-file-pdf mr-2"></i>Télécharger
        </button>
        <button v-if="factureActive?.statut === 'BROUILLON'" 
                @click="emettreFacture" 
                class="btn btn-primary">
          <i class="fas fa-paper-plane mr-2"></i>Émettre
        </button>
        <button v-if="['EMISE', 'EN_RETARD'].includes(factureActive?.statut || '')"
                @click="showPaiementModal"
                class="btn btn-success">
          <i class="fas fa-coins mr-2"></i>Paiement
        </button>
        <button v-if="factureActive?.statut !== 'ANNULEE' && factureActive?.statut !== 'PAYEE'"
                @click="showAnnulerModal"
                class="btn btn-danger">
          <i class="fas fa-times-circle mr-2"></i>Annuler
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="spinner"></div>
    </div>

    <div v-else-if="factureActive" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Détails de la facture -->
      <div class="lg:col-span-2">
        <div class="bg-white p-6 rounded-lg shadow-sm mb-4">
          <div class="flex justify-between mb-6">
            <div>
              <h2 class="text-xl font-semibold mb-2">Facture {{ factureActive.numeroFacture }}</h2>
              <p class="text-gray-600">{{ formatDate(factureActive.dateEmission) }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-blue-600">{{ formatCurrency(factureActive.montantTotal) }}</p>
              <p v-if="factureActive.montantPaye" class="text-sm text-gray-500">
                Payé: {{ formatCurrency(factureActive.montantPaye) }}
              </p>
              <p v-if="factureActive.montantRestant" class="text-sm text-gray-500">
                Restant: {{ formatCurrency(factureActive.montantRestant) }}
              </p>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="text-sm font-medium text-gray-500 uppercase mb-2">De</h3>
              <p class="font-medium">{{ factureActive.emetteur?.nom || 'Votre entreprise' }}</p>
              <p>{{ factureActive.emetteur?.adresse?.rue }}</p>
              <p>{{ factureActive.emetteur?.adresse?.codePostal }} {{ factureActive.emetteur?.adresse?.ville }}</p>
              <p>{{ factureActive.emetteur?.email }}</p>
              <p>{{ factureActive.emetteur?.telephone }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 uppercase mb-2">Pour</h3>
              <p class="font-medium">{{ factureActive.client?.nomComplet }}</p>
              <p>{{ factureActive.adresseFacturation?.rue }}</p>
              <p>{{ factureActive.adresseFacturation?.codePostal }} {{ factureActive.adresseFacturation?.ville }}</p>
              <p>{{ factureActive.client?.email }}</p>
              <p>{{ factureActive.client?.telephone }}</p>
            </div>
          </div>

          <!-- Lignes de facturation -->
          <table class="min-w-full mb-6">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4">Description</th>
                <th class="text-right py-3 px-4">Quantité</th>
                <th class="text-right py-3 px-4">Prix unitaire</th>
                <th class="text-right py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ligne, index) in factureActive.lignes" :key="index" class="border-b">
                <td class="py-3 px-4">
                  <div class="font-medium">{{ ligne.libelle }}</div>
                  <div class="text-sm text-gray-500" v-if="ligne.description">{{ ligne.description }}</div>
                </td>
                <td class="text-right py-3 px-4">{{ ligne.quantite }}</td>
                <td class="text-right py-3 px-4">{{ formatCurrency(ligne.prixUnitaire) }}</td>
                <td class="text-right py-3 px-4">{{ formatCurrency(ligne.montantTotal) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="py-3 px-4"></td>
                <td class="text-right py-3 px-4 font-medium">Sous-total</td>
                <td class="text-right py-3 px-4">{{ formatCurrency(factureActive.montantHT) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="py-3 px-4"></td>
                <td class="text-right py-3 px-4 font-medium">TVA ({{ factureActive.tauxTVA || 20 }}%)</td>
                <td class="text-right py-3 px-4">{{ formatCurrency(factureActive.montantTVA) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="py-3 px-4"></td>
                <td class="text-right py-3 px-4 font-medium text-lg">Total</td>
                <td class="text-right py-3 px-4 font-bold text-lg">{{ formatCurrency(factureActive.montantTotal) }}</td>
              </tr>
            </tfoot>
          </table>

          <div v-if="factureActive.notes" class="text-sm text-gray-600 mt-4 p-4 bg-gray-50 rounded">
            <strong>Notes:</strong> {{ factureActive.notes }}
          </div>
        </div>

        <!-- Contrat lié -->
        <div v-if="factureActive.contratId" class="bg-white p-6 rounded-lg shadow-sm mb-4">
          <h2 class="text-lg font-semibold mb-4">Contrat associé</h2>
          <div class="flex items-center justify-between">
            <div>
              <p><strong>Numéro de contrat:</strong> {{ factureActive.contrat?.numeroContrat || '-' }}</p>
              <p><strong>Type d'abonnement:</strong> {{ factureActive.contrat?.typeAbonnement || '-' }}</p>
            </div>
            <button @click="goToContrat(factureActive.contratId)" class="btn btn-outline">
              <i class="fas fa-external-link-alt mr-2"></i>Voir le contrat
            </button>
          </div>
        </div>

        <!-- Relevé de compteur -->
        <div v-if="factureActive.relevesCompteur?.length" class="bg-white p-6 rounded-lg shadow-sm mb-4">
          <h2 class="text-lg font-semibold mb-4">Relevés de compteur</h2>
          <table class="min-w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4">Date</th>
                <th class="text-right py-3 px-4">Index</th>
                <th class="text-right py-3 px-4">Consommation</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(releve, index) in factureActive.relevesCompteur" :key="index" class="border-b">
                <td class="py-3 px-4">{{ formatDate(releve.date) }}</td>
                <td class="text-right py-3 px-4">{{ releve.index }} {{ releve.unite }}</td>
                <td class="text-right py-3 px-4" v-if="index > 0">
                  {{ releve.index - factureActive.relevesCompteur[index-1].index }} {{ releve.unite }}
                </td>
                <td v-else class="text-right py-3 px-4">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sidebar avec infos complémentaires -->
      <div>
        <!-- Récapitulatif de paiement -->
        <div class="bg-white p-6 rounded-lg shadow-sm mb-4">
          <h2 class="text-lg font-semibold mb-4">Récapitulatif</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Montant total</span>
              <span class="font-medium">{{ formatCurrency(factureActive.montantTotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Montant payé</span>
              <span class="font-medium">{{ formatCurrency(factureActive.montantPaye || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Montant restant</span>
              <span class="font-medium">{{ formatCurrency((factureActive.montantTotal || 0) - (factureActive.montantPaye || 0)) }}</span>
            </div>
            <div class="border-t border-gray-200 my-3"></div>
            <div class="flex justify-between">
              <span class="text-gray-600">Statut</span>
              <span :class="['status-badge', getStatusClass(factureActive.statut)]">
                {{ getStatusLabel(factureActive.statut) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Date d'émission</span>
              <span>{{ formatDate(factureActive.dateEmission) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Date d'échéance</span>
              <span>{{ formatDate(factureActive.dateEcheance) }}</span>
            </div>
            <div v-if="factureActive.lotFacturationId" class="flex justify-between">
              <span class="text-gray-600">Lot de facturation</span>
              <span>{{ factureActive.lotFacturation?.nom || factureActive.lotFacturationId }}</span>
            </div>
          </div>
        </div>

        <!-- Historique des paiements -->
        <div class="bg-white p-6 rounded-lg shadow-sm mb-4">
          <h2 class="text-lg font-semibold mb-4">Historique des paiements</h2>
          <div v-if="factureActive.paiements && factureActive.paiements.length">
            <div v-for="(paiement, index) in factureActive.paiements" :key="index" class="flex justify-between py-2 border-b last:border-b-0">
              <div>
                <div class="font-medium">{{ formatDate(paiement.date) }}</div>
                <div class="text-sm text-gray-500">{{ getModeLabel(paiement.mode) }} {{ paiement.reference ? `- ${paiement.reference}` : '' }}</div>
              </div>
              <span class="font-medium">{{ formatCurrency(paiement.montant) }}</span>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-4">
            Aucun paiement enregistré
          </div>
        </div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
      <p class="font-medium">Une erreur est survenue</p>
      <p>{{ error }}</p>
    </div>

    <!-- Modal de paiement -->
    <div v-if="showPaiementModalFlag" class="modal-backdrop">
      <div class="modal-content max-w-md">
        <div class="modal-header">
          <h3 class="text-lg font-medium">Enregistrer un paiement</h3>
          <button @click="closePaiementModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="mb-4">
            <p class="mb-2"><strong>Facture:</strong> {{ factureActive?.numeroFacture }}</p>
            <p class="mb-2"><strong>Montant dû:</strong> {{ factureActive ? formatCurrency((factureActive.montantTotal || 0) - (factureActive.montantPaye || 0)) : '-' }}</p>
          </div>
          <div class="mb-4">
            <label class="form-label">Mode de paiement</label>
            <select v-model="paiement.mode" class="form-select w-full">
              <option value="CB">Carte bancaire</option>
              <option value="VIREMENT">Virement</option>
              <option value="CHEQUE">Chèque</option>
              <option value="ESPECES">Espèces</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="form-label">Montant</label>
            <input v-model.number="paiement.montant" type="number" step="0.01" class="form-input w-full">
          </div>
          <div class="mb-4">
            <label class="form-label">Date du paiement</label>
            <input v-model="paiement.date" type="date" class="form-input w-full">
          </div>
          <div class="mb-4">
            <label class="form-label">Référence</label>
            <input v-model="paiement.reference" type="text" class="form-input w-full" placeholder="Référence du paiement...">
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closePaiementModal" class="btn btn-outline">Annuler</button>
          <button @click="submitPaiement" class="btn btn-primary">Enregistrer</button>
        </div>
      </div>
    </div>

    <!-- Modal d'annulation -->
    <div v-if="showAnnulerModalFlag" class="modal-backdrop">
      <div class="modal-content max-w-md">
        <div class="modal-header">
          <h3 class="text-lg font-medium">Annuler la facture</h3>
          <button @click="closeAnnulerModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="mb-4 text-gray-700">Êtes-vous sûr de vouloir annuler cette facture ? Cette action ne peut pas être annulée.</p>
          <div class="mb-4">
            <label class="form-label">Motif d'annulation</label>
            <textarea v-model="motifAnnulation" class="form-textarea w-full" rows="3" placeholder="Veuillez indiquer le motif d'annulation..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeAnnulerModal" class="btn btn-outline">Annuler</button>
          <button @click="confirmAnnulerFacture" class="btn btn-danger">Confirmer l'annulation</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFactureStore } from '@/stores/facture.store';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const factureStore = useFactureStore();
const { factureActive, loading, error } = storeToRefs(factureStore);

// Modals
const showPaiementModalFlag = ref(false);
const showAnnulerModalFlag = ref(false);
const motifAnnulation = ref('');

// Données pour paiement
const paiement = reactive({
  mode: 'CB',
  montant: 0,
  date: new Date().toISOString().split('T')[0],
  reference: ''
});

// Fonctions utilitaires
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'BROUILLON': 'Brouillon',
    'EMISE': 'Émise',
    'PAYEE': 'Payée',
    'EN_RETARD': 'En retard',
    'ANNULEE': 'Annulée'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    'BROUILLON': 'bg-gray-200 text-gray-800',
    'EMISE': 'bg-blue-100 text-blue-800',
    'PAYEE': 'bg-green-100 text-green-800',
    'EN_RETARD': 'bg-red-100 text-red-800',
    'ANNULEE': 'bg-red-200 text-red-800'
  };
  return classMap[status] || '';
};

const getModeLabel = (mode: string) => {
  const modeMap: Record<string, string> = {
    'CB': 'Carte bancaire',
    'VIREMENT': 'Virement',
    'CHEQUE': 'Chèque',
    'ESPECES': 'Espèces'
  };
  return modeMap[mode] || mode;
};

// Actions
const goBack = () => {
  router.push('/factures');
};

const goToContrat = (contratId: string) => {
  router.push(`/contracts/${contratId}`);
};

const downloadPDF = async () => {
  if (!factureActive.value?.id) return;
  try {
    await factureStore.generatePDF(factureActive.value.id);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
  }
};

const emettreFacture = async () => {
  if (!factureActive.value?.id) return;
  try {
    await factureStore.emettreFacture(factureActive.value.id);
  } catch (error) {
    console.error('Erreur lors de l\'émission de la facture:', error);
  }
};

const showPaiementModal = () => {
  if (!factureActive.value) return;
  
  paiement.montant = 
    (factureActive.value.montantTotal || 0) - (factureActive.value.montantPaye || 0);
  showPaiementModalFlag.value = true;
};

const closePaiementModal = () => {
  showPaiementModalFlag.value = false;
  paiement.montant = 0;
  paiement.reference = '';
};

const submitPaiement = async () => {
  if (!factureActive.value?.id) return;
  
  try {
    await factureStore.enregistrerPaiement(factureActive.value.id, paiement);
    closePaiementModal();
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du paiement:', error);
  }
};

const showAnnulerModal = () => {
  showAnnulerModalFlag.value = true;
};

const closeAnnulerModal = () => {
  showAnnulerModalFlag.value = false;
  motifAnnulation.value = '';
};

const confirmAnnulerFacture = async () => {
  if (!factureActive.value?.id) return;
  
  try {
    await factureStore.annulerFacture(factureActive.value.id, motifAnnulation.value);
    closeAnnulerModal();
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la facture:', error);
  }
};

// Initialisation et réactions
onMounted(async () => {
  const factureId = route.params.id as string;
  if (factureId) {
    await factureStore.fetchFacture(factureId);
  }
});

// Réagir aux changements d'ID dans l'URL
watch(
  () => route.params.id,
  async (newId) => {
    if (newId && typeof newId === 'string') {
      await factureStore.fetchFacture(newId);
    }
  }
);
</script>

<style scoped>
.facture-detail-container {
  padding: 1.5rem;
}

.header {
  margin-bottom: 1.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-outline {
  border: 1px solid #d1d5db;
  background-color: white;
}

.btn-outline:hover {
  background-color: #f9fafb;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover {
  background-color: #059669;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-input, .form-select, .form-textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  width: 100%;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #2563eb;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
