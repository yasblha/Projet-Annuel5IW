<template>
  <div class="facture-container">
    <!-- Notification pour la génération de compteurs -->
    <div 
      v-if="notificationMessage" 
      class="fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg" 
      :class="notificationSuccess ? 'bg-green-100 border-green-500 text-green-900' : 'bg-red-100 border-red-500 text-red-900'"
    >
      <div class="flex items-center">
        <i class="fas mr-2" :class="notificationSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        <p>{{ notificationMessage }}</p>
        <button @click="notificationMessage = ''" class="ml-4">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div class="header">
      <h1 class="text-2xl font-semibold text-gray-800">Gestion des Factures</h1>
      <div class="flex items-center space-x-2">
        <button @click="showCreateFactureModal = true" 
                class="btn btn-secondary mr-2">
          <i class="fas fa-file-invoice mr-2"></i>Créer une facture
        </button>
        <button @click="showCreateLotModal = true" 
                class="btn btn-primary">
          <i class="fas fa-plus mr-2"></i>Créer un lot de facturation
        </button>
        <!-- Bouton de génération de compteurs -->
        <button
          @click="generateTestCompteurs"
          class="btn btn-outline"
          :disabled="loadingMeters"
        >
          <i class="fas fa-tint mr-2" v-if="loadingMeters"></i>
          <i class="fas fa-tint mr-2" v-else></i>
          <span>Générer des compteurs</span>
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters bg-white p-4 rounded-lg shadow-sm mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="text-sm text-gray-600">Statut</label>
          <select v-model="filters.statut" class="form-select w-full">
            <option value="">Tous</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="EMISE">Émise</option>
            <option value="PAYEE">Payée</option>
            <option value="EN_RETARD">En retard</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>
        <div>
          <label class="text-sm text-gray-600">Client</label>
          <input v-model="filters.clientName" type="text" placeholder="Nom du client" class="form-input w-full">
        </div>
        <div>
          <label class="text-sm text-gray-600">Date d'émission</label>
          <input v-model="filters.dateEmission" type="date" class="form-input w-full">
        </div>
        <div>
          <label class="text-sm text-gray-600">Numéro de facture</label>
          <input v-model="filters.numeroFacture" type="text" placeholder="FT-XXXX" class="form-input w-full">
        </div>
      </div>
      <div class="flex justify-end mt-4">
        <button @click="resetFilters" class="btn btn-outline mr-2">Réinitialiser</button>
        <button @click="applyFilters" class="btn btn-primary">Filtrer</button>
      </div>
    </div>

    <!-- Onglets -->
    <div class="tabs flex space-x-4 border-b">
      <button :class="['tab-item', { active: activeTab === 'all' }]" @click="loadAllInvoices">
        Toutes les factures
      </button>
      <button :class="['tab-item', { active: activeTab === 'unpaid' }]" @click="loadUnpaidInvoices">
        Impayées <span class="badge bg-red-500 text-white ml-2">{{ factureStore.facturesImpayees.length || 0 }}</span>
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="factureStore.loading" class="flex justify-center my-8">
      <div class="spinner"></div>
    </div>

    <!-- Liste des factures -->
    <div v-else class="facture-list">
      <template v-if="displayedFactures.length">
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="th">N° Facture</th>
                <th class="th">Client</th>
                <th class="th">Montant</th>
                <th class="th">Date Émission</th>
                <th class="th">Date Échéance</th>
                <th class="th">Statut</th>
                <th class="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="facture in displayedFactures" :key="facture.id" class="hover:bg-gray-50">
                <td class="td">{{ facture.numeroFacture || '-' }}</td>
                <td class="td">{{ facture.client?.nomComplet || '-' }}</td>
                <td class="td font-medium">{{ formatCurrency(facture.montantTotal) }}</td>
                <td class="td">{{ formatDate(facture.dateEmission) }}</td>
                <td class="td">{{ formatDate(facture.dateEcheance) }}</td>
                <td class="td">
                  <span :class="['status-badge', getStatusClass(facture.statut)]">
                    {{ getStatusLabel(facture.statut) }}
                  </span>
                </td>
                <td class="td">
                  <div class="flex space-x-2">
                    <button @click="viewFacture(facture.id)" class="action-btn">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button v-if="facture.statut === 'BROUILLON'" 
                            @click="emettreFacture(facture.id)"
                            class="action-btn text-blue-600">
                      <i class="fas fa-paper-plane"></i>
                    </button>
                    <button v-if="['EMISE', 'EN_RETARD'].includes(facture.statut)"
                            @click="showPaiementModal(facture)"
                            class="action-btn text-green-600">
                      <i class="fas fa-coins"></i>
                    </button>
                    <button @click="downloadPDF(facture.id)" class="action-btn text-gray-600">
                      <i class="fas fa-file-pdf"></i>
                    </button>
                    <button v-if="facture.statut !== 'ANNULEE' && facture.statut !== 'PAYEE'"
                            @click="showAnnulerModal(facture.id)"
                            class="action-btn text-red-600">
                      <i class="fas fa-times-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination mt-4 flex justify-between items-center">
          <span>Affichage de {{ displayedFactures.length }} facture(s)</span>
          <div class="flex space-x-2">
            <button :disabled="currentPage === 1" 
                    @click="currentPage--" 
                    class="btn btn-sm btn-outline">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="px-4 py-1">Page {{ currentPage }} / {{ totalPages || 1 }}</span>
            <button :disabled="currentPage >= totalPages" 
                    @click="currentPage++" 
                    class="btn btn-sm btn-outline">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </template>

      <div v-else class="empty-state">
        <div class="text-center py-10">
          <div class="text-gray-400 text-5xl mb-4">
            <i class="fas fa-file-invoice"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-700">Aucune facture trouvée</h3>
          <p class="text-gray-500 mt-2">Aucune facture ne correspond à vos critères de recherche.</p>
        </div>
      </div>
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
            <p class="mb-2"><strong>Facture:</strong> {{ selectedFacture?.numeroFacture }}</p>
            <p class="mb-2"><strong>Client:</strong> {{ selectedFacture?.client?.nomComplet }}</p>
            <p class="mb-2"><strong>Montant dû:</strong> {{ selectedFacture ? formatCurrency(selectedFacture.montantTotal - (selectedFacture.montantPaye || 0)) : '-' }}</p>
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

    <!-- Modal de création de lot -->
    <div v-if="showCreateLotModal" class="modal-backdrop">
      <div class="modal-content max-w-md">
        <div class="modal-header">
          <h3 class="text-lg font-medium">Créer un lot de facturation</h3>
          <button @click="closeCreateLotModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="mb-4">
            <label class="form-label">Nom du lot</label>
            <input v-model="lotFacturation.nom" type="text" class="form-input w-full" placeholder="Nom du lot...">
          </div>
          <div class="mb-4">
            <label class="form-label">Période</label>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs text-gray-600">Début</label>
                <input v-model="lotFacturation.periodeDebut" type="date" class="form-input w-full">
              </div>
              <div>
                <label class="text-xs text-gray-600">Fin</label>
                <input v-model="lotFacturation.periodeFin" type="date" class="form-input w-full">
              </div>
            </div>
          </div>
          <div class="mb-4">
            <label class="form-label">Date d'échéance</label>
            <input v-model="lotFacturation.dateEcheance" type="date" class="form-input w-full">
          </div>
          <div class="mb-4">
            <label class="form-label">Type de facturation</label>
            <select v-model="lotFacturation.type" class="form-select w-full">
              <option value="MENSUELLE">Mensuelle</option>
              <option value="TRIMESTRIELLE">Trimestrielle</option>
              <option value="ANNUELLE">Annuelle</option>
              <option value="PONCTUELLE">Ponctuelle</option>
            </select>
          </div>
          <div class="mb-4">
            <div class="flex items-center">
              <input v-model="lotFacturation.generateFactures" type="checkbox" id="generateFactures" class="form-checkbox">
              <label for="generateFactures" class="ml-2">Générer les factures immédiatement</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeCreateLotModal" class="btn btn-outline">Annuler</button>
          <button @click="submitLotFacturation" class="btn btn-primary">Créer</button>
        </div>
      </div>
    </div>

    <!-- Modal pour créer une facture -->
    <div v-if="showCreateFactureModal" class="modal-backdrop">
      <div class="modal-content max-w-lg">
        <div class="modal-header">
          <h3 class="text-lg font-medium">Créer une nouvelle facture</h3>
          <button @click="closeCreateFactureModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Client*</label>
              <select v-model="nouvelleFacture.clientId" class="form-select w-full" required>
                <option value="" disabled>Sélectionner un client</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.nomComplet }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Contrat*</label>
              <select v-model="nouvelleFacture.contratId" class="form-select w-full" required @change="chargerDonneesCompteur">
                <option value="" disabled>Sélectionner un contrat</option>
                <option v-for="contrat in contratsFiltres" :key="contrat.id" :value="contrat.id">
                  {{ contrat.reference }} - {{ contrat.description }}
                </option>
              </select>
            </div>
            
            <!-- Informations sur le compteur -->
            <div v-if="compteurInfo" class="bg-gray-50 p-3 rounded border border-gray-200">
              <h4 class="font-medium text-gray-700 mb-2">Informations du compteur</h4>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-gray-600">Référence:</span> 
                  <span class="font-medium">{{ compteurInfo.reference || 'N/A' }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Date d'installation:</span> 
                  <span class="font-medium">{{ formatDate(compteurInfo.dateInstallation) || 'N/A' }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Dernier relevé:</span> 
                  <span class="font-medium">{{ compteurInfo.initialReading || 0 }} m³</span>
                </div>
              </div>
            </div>
            
            <!-- Sélection du compteur -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Compteur*</label>
              <select v-model="nouvelleFacture.compteurId" class="form-select w-full" required @change="selectionnerCompteur">
                <option value="" disabled>Sélectionner un compteur</option>
                <option v-for="compteur in compteursDisponibles" :key="compteur.id" :value="compteur.id">
                  {{ compteur.reference }} - {{ compteur.description }}
                </option>
              </select>
            </div>
            
            <!-- Calcul de consommation -->
            <div v-if="compteurInfo" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nouveau relevé (m³)*</label>
                <input 
                  type="number" 
                  v-model.number="nouveauReleve" 
                  class="form-input w-full" 
                  @input="calculerConsommation" 
                  min="0" 
                  :min="compteurInfo.initialReading || 0"
                  step="0.01" 
                  placeholder="Relevé actuel"
                  required 
                />
                <p v-if="erreurReleve" class="text-red-500 text-xs mt-1">{{ erreurReleve }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Consommation (m³)</label>
                <input type="number" v-model.number="consommation" class="form-input w-full bg-gray-100" readonly />
              </div>
            </div>
            
            <!-- Prix unitaire et calcul automatique -->
            <div v-if="compteurInfo && nouveauReleve && !erreurReleve" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Prix unitaire (€/m³)*</label>
                <input 
                  type="number" 
                  v-model.number="prixUnitaire" 
                  class="form-input w-full" 
                  step="0.01" 
                  @input="calculerMontant" 
                  min="0.01"
                  placeholder="0.00"
                  required 
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Montant HT (€)</label>
                <input type="number" v-model.number="nouvelleFacture.montantHT" class="form-input w-full bg-gray-100" readonly />
              </div>
            </div>
            
            <div v-if="!compteurInfo && nouvelleFacture.contratId" class="text-center py-3 text-amber-600">
              <i class="fas fa-exclamation-circle mr-2"></i>
              Aucune donnée de compteur disponible pour ce contrat. Veuillez saisir le montant manuellement.
            </div>
            
            <!-- Champs standards pour les factures sans compteur -->
            <div v-if="!compteurInfo || erreurReleve">
              <label class="block text-sm font-medium text-gray-700">Montant HT*</label>
              <input type="number" step="0.01" v-model.number="nouvelleFacture.montantHT" class="form-input w-full" required placeholder="0.00" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Taux TVA (%)</label>
              <input v-model.number="nouvelleFacture.tauxTVA" type="number" step="0.1" class="form-input w-full" placeholder="20.0">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date d'échéance*</label>
              <input v-model="nouvelleFacture.dateEcheance" type="date" class="form-input w-full" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea v-model="nouvelleFacture.description" rows="3" class="form-textarea w-full" placeholder="Description de la facture"></textarea>
            </div>
          </div>
          <p class="text-xs text-gray-600 mt-2">* Champs obligatoires</p>
        </div>
        <div class="modal-footer">
          <button @click="closeCreateFactureModal" class="btn btn-outline">Annuler</button>
          <button @click="submitCreateFacture" :disabled="!isFormValid" class="btn btn-primary">Créer la facture</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useFactureStore } from '@/stores/facture.store';
import { useClientStore } from '@/stores/client.store';
import { useContractStore } from '@/stores/contract.store';
import { useMeterStore } from '@/stores/meter.store';
import { useNotificationStore } from '@/stores/notification.store';

// Initialiser les stores
const factureStore = useFactureStore();
const clientStore = useClientStore();
const contratStore = useContractStore();
const meterStore = useMeterStore();
const notificationStore = useNotificationStore();

// Destructurer les références réactives des stores
const { factures, facturesImpayees, loading: loadingFactures, error } = storeToRefs(factureStore);
const { clients, loading: loadingClients } = storeToRefs(clientStore);
const { contracts: contrats, loading: loadingContrats } = storeToRefs(contratStore);
const { isLoading: loadingMeters } = storeToRefs(meterStore);

// État local
const currentPage = ref(1);
const activeTab = ref('unpaid');
const loading = ref(false);
const filters = reactive({
  statut: '',
  clientName: '',
  dateEmission: '',
  numeroFacture: ''
});

// Modals
const showPaiementModalFlag = ref(false);
const showAnnulerModalFlag = ref(false);
const showCreateLotModal = ref(false);
const showCreateFactureModal = ref(false);
const selectedFacture = ref<any>(null);
const selectedFactureId = ref<string>('');
const motifAnnulation = ref('');

// Données pour paiement
const paiement = reactive({
  mode: 'CB',
  montant: 0,
  date: new Date().toISOString().split('T')[0],
  reference: ''
});

// Données pour lot de facturation
const lotFacturation = reactive({
  nom: '',
  periodeDebut: new Date().toISOString().split('T')[0],
  periodeFin: '',
  dateEcheance: '',
  type: 'MENSUELLE',
  generateFactures: false
});

// Données pour création de facture
const nouvelleFacture = reactive({
  clientId: '',
  contratId: '',
  compteurId: '',
  montantHT: 0,
  tauxTVA: 20.0,
  dateEcheance: '',
  description: ''
});

// Données pour le calcul de consommation
const compteurInfo = ref(null);
const nouveauReleve = ref(null);
const consommation = ref(0);
const prixUnitaire = ref(3.5); // Prix par défaut en €/m³
const erreurReleve = ref('');
const compteursDisponibles = ref([]); // Liste des compteurs associés au contrat

// Validation du formulaire
const isFormValid = computed(() => {
  if (!nouvelleFacture.clientId || !nouvelleFacture.contratId || !nouvelleFacture.dateEcheance) {
    return false;
  }
  
  // Validation spécifique pour les factures avec compteur
  if (compteurInfo.value && nouveauReleve.value !== null) {
    // Vérifier que le nouveau relevé est supérieur à l'ancien
    const ancienReleve = Number(compteurInfo.value.initialReading) || 0;
    const nouveauReleveNum = Number(nouveauReleve.value) || 0;
    
    if (nouveauReleveNum <= ancienReleve || erreurReleve.value) {
      return false;
    }
    
    // Vérifier le prix unitaire
    if (prixUnitaire.value <= 0) {
      return false;
    }
  }
  
  // Pour tous les types de factures, le montant HT doit être positif
  return nouvelleFacture.montantHT > 0;
});

// Filtrer les contrats en fonction du client sélectionné
const contratsFiltres = computed(() => {
  if (!nouvelleFacture.clientId) return [];
  return contrats.value.filter((contrat: any) => contrat.clientId === nouvelleFacture.clientId);
});

// Factures filtrées et affichées
const displayedFactures = computed(() => {
  if (activeTab.value === 'unpaid') {
    return factureStore.facturesImpayees;
  }
  return factureStore.factures;
});

// Fonctions utilitaires
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR').format(date);
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

// Actions
const viewFacture = (id: string) => {
  // router.push(`/factures/${id}`);
};

const loadUnpaidInvoices = async () => {
  try {
    activeTab.value = 'unpaid';
    loading.value = true;
    await factureStore.fetchFacturesImpayees();
    loading.value = false;
  } catch (error) {
    console.error('Erreur lors du chargement des factures impayées:', error);
    loading.value = false;
  }
};

const loadAllInvoices = async () => {
  try {
    activeTab.value = 'all';
    loading.value = true;
    await factureStore.fetchFactures();
    loading.value = false;
  } catch (error) {
    console.error('Erreur lors du chargement de toutes les factures:', error);
    loading.value = false;
  }
};

const emettreFacture = async (id: string) => {
  try {
    await factureStore.emettreFacture(id);
  } catch (error) {
    console.error('Erreur lors de l\'émission de la facture:', error);
  }
};

const showPaiementModal = (facture: any) => {
  selectedFacture.value = facture;
  paiement.montant = facture.montantTotal - (facture.montantPaye || 0);
  showPaiementModalFlag.value = true;
};

const closePaiementModal = () => {
  showPaiementModalFlag.value = false;
  selectedFacture.value = null;
  paiement.montant = 0;
  paiement.reference = '';
};

const submitPaiement = async () => {
  if (!selectedFacture.value) return;
  
  try {
    await factureStore.enregistrerPaiement(selectedFacture.value.id, paiement);
    closePaiementModal();
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du paiement:', error);
  }
};

const showAnnulerModal = (id: string) => {
  selectedFactureId.value = id;
  showAnnulerModalFlag.value = true;
};

const closeAnnulerModal = () => {
  showAnnulerModalFlag.value = false;
  selectedFactureId.value = '';
  motifAnnulation.value = '';
};

const confirmAnnulerFacture = async () => {
  if (!selectedFactureId.value) return;
  
  try {
    await factureStore.annulerFacture(selectedFactureId.value, motifAnnulation.value);
    closeAnnulerModal();
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la facture:', error);
  }
};

const closeCreateLotModal = () => {
  showCreateLotModal.value = false;
  lotFacturation.nom = '';
  lotFacturation.periodeDebut = new Date().toISOString().split('T')[0];
  lotFacturation.periodeFin = '';
  lotFacturation.dateEcheance = '';
  lotFacturation.type = 'MENSUELLE';
  lotFacturation.generateFactures = false;
};

const submitLotFacturation = async () => {
  try {
    const lot = await factureStore.createLotFacturation(lotFacturation);
    
    // Si l'option est activée, générer les factures pour le lot créé
    if (lotFacturation.generateFactures && lot?.id) {
      await factureStore.generateFacturesLot(lot.id);
    }
    
    closeCreateLotModal();
  } catch (error) {
    console.error('Erreur lors de la création du lot de facturation:', error);
  }
};

const closeCreateFactureModal = () => {
  showCreateFactureModal.value = false;
  nouvelleFacture.clientId = '';
  nouvelleFacture.contratId = '';
  nouvelleFacture.compteurId = '';
  nouvelleFacture.montantHT = 0;
  nouvelleFacture.tauxTVA = 20.0;
  nouvelleFacture.dateEcheance = '';
  nouvelleFacture.description = '';
};

const submitCreateFacture = async () => {
  try {
    await factureStore.createFacture(nouvelleFacture);
    closeCreateFactureModal();
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
  }
};

const downloadPDF = async (id: string) => {
  try {
    await factureStore.generatePDF(id);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
  }
};

const resetFilters = () => {
  filters.statut = '';
  filters.clientName = '';
  filters.dateEmission = '';
  filters.numeroFacture = '';
  applyFilters();
};

const applyFilters = async () => {
  // Implémenter la logique de filtrage ici
  // Cette fonction doit appeler un service API avec les filtres ou filtrer les données localement
  console.log('Filters applied:', filters);
};

// Charger les informations du compteur quand un contrat est sélectionné
const chargerDonneesCompteur = async () => {
  if (!nouvelleFacture.contratId) {
    compteurInfo.value = null;
    compteursDisponibles.value = [];
    nouvelleFacture.compteurId = '';
    return;
  }
  
  try {
    // Récupérer les compteurs associés au contrat
    const compteurs = await meterStore.getMetersByContractId(nouvelleFacture.contratId);
    compteursDisponibles.value = compteurs.items || compteurs;
    
    if (compteursDisponibles.value.length > 0) {
      // Pré-sélectionner le premier compteur par défaut
      nouvelleFacture.compteurId = compteursDisponibles.value[0].id;
      await selectionnerCompteur(nouvelleFacture.compteurId);
    } else {
      compteurInfo.value = null;
      nouveauReleve.value = null;
      consommation.value = 0;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des compteurs:', error);
    compteurInfo.value = null;
    compteursDisponibles.value = [];
  }
};

// Sélectionner un compteur spécifique
const selectionnerCompteur = async (compteurId) => {
  if (!compteurId) {
    compteurInfo.value = null;
    return;
  }
  
  try {
    // Obtenir les détails du compteur sélectionné
    const compteur = compteursDisponibles.value.find(c => c.id === compteurId);
    
    if (compteur) {
      compteurInfo.value = {
        id: compteur.id,
        reference: compteur.serial,
        dateInstallation: compteur.dateInstallation,
        initialReading: compteur.valeurDernierReleve || 0
      };
      
      // Réinitialiser les valeurs
      nouveauReleve.value = null;
      consommation.value = 0;
      nouvelleFacture.montantHT = 0;
    } else {
      compteurInfo.value = null;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données du compteur:', error);
    compteurInfo.value = null;
  }
};

// Observer les changements de compteurId
watch(() => nouvelleFacture.compteurId, async (newCompteurId) => {
  if (newCompteurId) {
    await selectionnerCompteur(newCompteurId);
  } else {
    compteurInfo.value = null;
  }
});

// Calculer la consommation d'eau basée sur le nouveau relevé
const calculerConsommation = () => {
  if (!compteurInfo.value || nouveauReleve.value === null) {
    consommation.value = 0;
    return;
  }
  
  const ancienReleve = Number(compteurInfo.value.initialReading) || 0;
  const nouveauReleveNum = Number(nouveauReleve.value) || 0;
  
  if (nouveauReleveNum <= ancienReleve) {
    erreurReleve.value = `Le nouveau relevé doit être supérieur à l'ancien (${ancienReleve} m³)`;
    consommation.value = 0;
    nouvelleFacture.montantHT = 0;
    return;
  }
  
  erreurReleve.value = '';
  consommation.value = Number((nouveauReleveNum - ancienReleve).toFixed(2));
  calculerMontant();
};

// Calculer le montant HT basé sur la consommation et le prix unitaire
const calculerMontant = () => {
  if (consommation.value > 0 && prixUnitaire.value > 0) {
    nouvelleFacture.montantHT = Number((consommation.value * prixUnitaire.value).toFixed(2));
  }
};

// Initialisation
onMounted(async () => {
  // Charger les factures au montage du composant
  try {
    loading.value = true;
    // Charger les factures impayées
    await factureStore.fetchFacturesImpayees();
    activeTab.value = 'unpaid';
    
    // Charger les clients et contrats pour le formulaire de création
    await clientStore.listClients();
    await contratStore.listContracts();
    loading.value = false;
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    loading.value = false;
  }
});

// Surveiller les changements de client pour réinitialiser le contrat sélectionné
watch(() => nouvelleFacture.clientId, (newClientId) => {
  if (newClientId) {
    nouvelleFacture.contratId = '';
  }
});

// Générer des compteurs de test
const notificationMessage = ref('');
const notificationSuccess = ref(true);

const generateTestCompteurs = async () => {
  try {
    const result = await meterStore.generateTestMeters();
    notificationMessage.value = result.success 
      ? 'Compteurs de test générés avec succès !' 
      : `Erreur: ${result.message}`;
    notificationSuccess.value = result.success;
    
    setTimeout(() => {
      notificationMessage.value = '';
    }, 5000);
  } catch (error) {
    console.error('Erreur lors de la génération des compteurs de test:', error);
    notificationMessage.value = 'Une erreur est survenue lors de la génération des compteurs';
    notificationSuccess.value = false;
    
    setTimeout(() => {
      notificationMessage.value = '';
    }, 5000);
  }
};
</script>

<style scoped>
.facture-container {
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tabs {
  border-bottom: 1px solid #e5e7eb;
}

.tab-list {
  display: flex;
  overflow-x: auto;
}

.tab-item {
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  color: #4b5563;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.tab-item.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 500;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: transparent;
}

.action-btn:hover {
  background-color: #f3f4f6;
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

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
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
