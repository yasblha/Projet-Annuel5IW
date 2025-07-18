<template>
  <div class="client-details">
    <div v-if="loading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="client">
      <!-- En-tête avec informations client -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ clientName }}</h1>
            <p class="text-gray-500">{{ client.type === 'PARTICULIER' ? 'Client particulier' : 'Entreprise/Organisation' }}</p>
          </div>
          <div class="flex space-x-2">
            <button @click="editClient" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
              <i class="fas fa-edit mr-2"></i> Modifier
            </button>
          </div>
        </div>
      </div>

      <!-- Informations client -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h2>
          <div class="space-y-3">
            <div>
              <span class="text-gray-500">Email:</span>
              <p class="font-medium">{{ client.email || 'Non renseigné' }}</p>
            </div>
            <div>
              <span class="text-gray-500">Téléphone:</span>
              <p class="font-medium">{{ client.telephone || 'Non renseigné' }}</p>
            </div>
            <div>
              <span class="text-gray-500">Mobile:</span>
              <p class="font-medium">{{ client.mobile || 'Non renseigné' }}</p>
            </div>
            <div v-if="client.type === 'ENTREPRISE'">
              <span class="text-gray-500">SIRET:</span>
              <p class="font-medium">{{ client.siret || 'Non renseigné' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Adresse de facturation</h2>
          <div v-if="client.adresse" class="space-y-1">
            <p>{{ client.adresse.rue }}</p>
            <p>{{ client.adresse.codePostal }} {{ client.adresse.ville }}</p>
            <p>{{ client.adresse.pays || 'France' }}</p>
            <div class="mt-3 pt-3 border-t border-gray-100">
              <span class="text-gray-500">Type d'adresse:</span>
              <p class="font-medium">{{ client.adresse.type || 'PRINCIPALE' }}</p>
            </div>
          </div>
          <div v-else class="text-gray-500">
            Aucune adresse renseignée
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations supplémentaires</h2>
          <div class="space-y-3">
            <div>
              <span class="text-gray-500">Statut:</span>
              <p class="font-medium">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="client.statut === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                  {{ client.statut || 'ACTIF' }}
                </span>
              </p>
            </div>
            <div>
              <span class="text-gray-500">Date de création:</span>
              <p class="font-medium">{{ formatDate(client.dateCreation) }}</p>
            </div>
            <div v-if="client.type === 'PARTICULIER'">
              <span class="text-gray-500">Date de naissance:</span>
              <p class="font-medium">{{ formatDate(client.dateNaissance) || 'Non renseignée' }}</p>
            </div>
            <div>
              <span class="text-gray-500">Nombre de contrats:</span>
              <p class="font-medium">{{ allContracts.length || 0 }}</p>
            </div>
            <div>
              <span class="text-gray-500">Nombre de compteurs:</span>
              <p class="font-medium">{{ metersWithData.length || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglets pour contrats, compteurs, consommation, factures et informations bancaires -->
      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex overflow-x-auto">
            <button @click="activeTab = 'contracts'" 
                   class="py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap"
                   :class="activeTab === 'contracts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
              Contrats
            </button>
            <button @click="activeTab = 'meters'" 
                   class="py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap"
                   :class="activeTab === 'meters' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
              Compteurs
            </button>
            <button @click="activeTab = 'consumption'" 
                   class="py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap"
                   :class="activeTab === 'consumption' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
              Consommation
            </button>
            <button @click="activeTab = 'invoices'" 
                   class="py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap"
                   :class="activeTab === 'invoices' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
              Factures
            </button>
            <button @click="activeTab = 'banking'" 
                   class="py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap"
                   :class="activeTab === 'banking' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
              Informations bancaires
            </button>
          </nav>
        </div>

        <!-- Contrats du client -->
        <div v-if="activeTab === 'contracts'" class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Contrats ({{ allContracts.length }})</h2>
            <RouterLink :to="`/contracts/new?client=${client.id}`" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <i class="fas fa-plus mr-2"></i> Nouveau contrat
            </RouterLink>
          </div>

          <div v-if="loadingContracts" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
          
          <div v-else-if="allContracts.length === 0" class="text-center py-8 text-gray-500">
            <i class="fas fa-file-contract text-4xl mb-3"></i>
            <p>Ce client n'a pas encore de contrat</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date début</th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date fin</th>
                  <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="contract in allContracts" :key="contract.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ contract.numero }}
                    <span v-if="contract.isV2" class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">V2</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatContractType(contract.typeContrat) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="getStatusClass(contract.statut)">
                      {{ formatStatus(contract.statut) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(contract.dateDebut) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(contract.dateFin) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <RouterLink v-if="contract.isV2" :to="`/dashboard/contrats/v2/${contract.id}`" class="text-blue-600 hover:text-blue-900">Détails</RouterLink>
                    <RouterLink v-else :to="`/contracts/${contract.id}`" class="text-blue-600 hover:text-blue-900">Détails</RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Compteurs du client -->
        <div v-if="activeTab === 'meters'" class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Compteurs</h2>

          <div v-if="loadingMeters" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>

          <div v-else-if="!hasMeters" class="text-center py-8 text-gray-500">
            <i class="fas fa-tachometer-alt text-4xl mb-3"></i>
            <p>Aucun compteur associé à ce client</p>
          </div>

          <div v-else>
            <!-- Liste des compteurs -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                    <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="meter in metersWithData" :key="meter.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ meter.numero }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ meter.adresse ? `${meter.adresse.rue}, ${meter.adresse.ville}` : 'Adresse non spécifiée' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <RouterLink :to="`/meters/${meter.id}`" class="text-blue-600 hover:text-blue-900">Détails</RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Consommation des compteurs -->
        <div v-if="activeTab === 'consumption'" class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Consommation des compteurs</h2>

          <div v-if="loadingMeters" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>

          <div v-else-if="!hasMeters" class="text-center py-8 text-gray-500">
            <i class="fas fa-tachometer-alt text-4xl mb-3"></i>
            <p>Aucun compteur associé à ce client</p>
          </div>

          <div v-else>
            <!-- Sélection du compteur -->
            <div class="mb-6" v-if="metersWithData.length > 0">
              <label class="block text-sm font-medium text-gray-700 mb-1">Sélectionner un compteur:</label>
              <select 
                v-model="selectedMeter" 
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option v-for="meter in metersWithData" :key="meter.id" :value="meter.id">
                  {{ meter.numero }} ({{ meter.adresse ? `${meter.adresse.rue}, ${meter.adresse.ville}` : 'Adresse non spécifiée' }})
                </option>
              </select>
            </div>

            <!-- Graphique de consommation -->
            <div class="bg-gray-50 rounded-lg p-4 mb-4 h-80" v-if="selectedMeter && meterConsumptionData[selectedMeter]?.length">
              <LineChart 
                :data="consumptionChartData" 
                :options="consumptionChartOptions" 
              />
            </div>

            <!-- Tableau de données de consommation -->
            <div class="overflow-x-auto" v-if="selectedMeter && meterConsumptionData[selectedMeter]?.length">
              <h3 class="text-md font-medium text-gray-900 mb-2">Historique de consommation</h3>
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relevé</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consommation</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de relevé</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(record, index) in sortedConsumptionData" :key="index" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(record.date) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.valeur }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.consommation || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.typeReleve }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Factures du client -->
        <div v-if="activeTab === 'invoices'" class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Factures</h2>

          <div v-if="loadingInvoices" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>

          <div v-else-if="!hasInvoices" class="text-center py-8 text-gray-500">
            <i class="fas fa-file-invoice text-4xl mb-3"></i>
            <p>Aucune facture associée à ce client</p>
          </div>

          <div v-else>
            <!-- Liste des factures -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ invoice.numero }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(invoice.date) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ invoice.montant }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <RouterLink :to="`/invoices/${invoice.id}`" class="text-blue-600 hover:text-blue-900">Détails</RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Informations bancaires du client -->
        <div v-if="activeTab === 'banking'" class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations bancaires</h2>

          <div v-if="loadingBanking" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>

          <div v-else-if="!hasBanking" class="text-center py-8 text-gray-500">
            <i class="fas fa-university text-4xl mb-3"></i>
            <p>Aucune information bancaire associée à ce client</p>
          </div>

          <div v-else>
            <!-- Liste des informations bancaires -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titulaire</th>
                    <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="banking in banking" :key="banking.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ banking.type }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ banking.numero }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ banking.titulaire }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <RouterLink :to="`/banking/${banking.id}`" class="text-blue-600 hover:text-blue-900">Détails</RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-circle text-red-400"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clientApi } from '@/services/api/client.service';
import { useAnalyticsStore } from '@/stores/analytics.store';
import { useContractV2Store } from '@/stores/contract-v2.store';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line as LineChart } from 'vue-chartjs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const route = useRoute();
const router = useRouter();
const analyticsStore = useAnalyticsStore();
const contractV2Store = useContractV2Store();

// États
const client = ref(null);
const clientContracts = ref([]);
const clientContractsV2 = ref([]);
const allContracts = computed(() => {
  return [
    ...clientContracts.value,
    ...clientContractsV2.value.map(c => ({
      ...c,
      isV2: true, // Marquer comme contrat v2 pour l'affichage
      typeContrat: c.type || c.typeContrat, // Harmoniser les noms de champs
      statut: c.status || c.statut || 'ACTIF',
      dateDebut: c.startDate || c.dateDebut,
      dateFin: c.endDate || c.dateFin,
      numero: c.numeroContrat || c.reference || c.id // Utiliser le numéro du contrat ou une référence
    }))
  ];
});
const metersWithData = ref([]);
const meterConsumptionData = ref({});
const selectedMeter = ref(null);
const loading = ref(true);
const loadingContracts = ref(false);
const loadingMeters = ref(false);
const loadingInvoices = ref(false);
const loadingBanking = ref(false);
const error = ref(null);
const activeTab = ref('contracts');
const invoices = ref([]);
const banking = ref([]);

// Récupérer le client
const loadClient = async () => {
  try {
    loading.value = true;
    error.value = null;
    const clientId = route.params.id;
    const response = await clientApi.getById(clientId);
    client.value = response.data || response;
    
    // Adapter le format d'adresse si nécessaire pour l'affichage
    if (client.value && client.value.adresse) {
      if (client.value.adresse.ligne1 && !client.value.adresse.rue) {
        client.value.adresse.rue = client.value.adresse.ligne1;
      }
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors du chargement des données du client';
    console.error('Erreur client:', err);
  } finally {
    loading.value = false;
  }
};

// Récupérer les contrats du client
const loadClientContracts = async () => {
  if (!client.value?.id) return;

  try {
    loadingContracts.value = true;
    const contracts = await analyticsStore.fetchClientContracts(client.value.id);
    clientContracts.value = contracts || [];
    
    // Une fois les contrats chargés, rechercher les compteurs
    if (clientContracts.value.length > 0) {
      await loadMeters();
    }
  } catch (err) {
    console.error('Erreur lors du chargement des contrats:', err);
  } finally {
    loadingContracts.value = false;
  }
};

// Récupérer les contrats v2 du client
const loadClientContractsV2 = async () => {
  if (!client.value?.id) return;

  try {
    const contractsV2 = await contractV2Store.fetchClientContractsV2(client.value.id);
    clientContractsV2.value = contractsV2 || [];
  } catch (err) {
    console.error('Erreur lors du chargement des contrats v2:', err);
  }
};

// Récupérer les factures du client
const loadClientInvoices = async () => {
  if (!client.value?.id) return;

  try {
    loadingInvoices.value = true;
    // Remplacer par l'appel API réel quand disponible
    // const response = await invoiceService.getByClientId(client.value.id);
    // invoices.value = response || [];
    
    // Données de test en attendant l'API réelle
    invoices.value = [
      {
        id: '1',
        numero: 'FACT-2025-001',
        date: new Date().toISOString(),
        montant: '120,50 €',
        statut: 'PAYÉE'
      },
      {
        id: '2',
        numero: 'FACT-2025-002',
        date: new Date().toISOString(),
        montant: '85,30 €',
        statut: 'EN_ATTENTE'
      }
    ];
  } catch (err) {
    console.error('Erreur lors du chargement des factures:', err);
  } finally {
    loadingInvoices.value = false;
  }
};

// Récupérer les informations bancaires du client
const loadClientBanking = async () => {
  if (!client.value?.id) return;

  try {
    loadingBanking.value = true;
    // Remplacer par l'appel API réel quand disponible
    // const response = await bankingService.getByClientId(client.value.id);
    // banking.value = response || [];
    
    // Données de test en attendant l'API réelle
    banking.value = [
      {
        id: '1',
        type: 'IBAN',
        numero: 'FR76 XXXX XXXX XXXX XXXX XXXX XXX',
        titulaire: client.value.type === 'PARTICULIER' 
          ? `${client.value.prenom} ${client.value.nom}` 
          : client.value.raisonSociale,
        default: true
      }
    ];
  } catch (err) {
    console.error('Erreur lors du chargement des informations bancaires:', err);
  } finally {
    loadingBanking.value = false;
  }
};

// Récupérer les compteurs des contrats
const loadMeters = async () => {
  try {
    loadingMeters.value = true;
    
    // Récupérer les compteurs associés aux contrats
    const meters = [];
    for (const contract of clientContracts.value) {
      if (contract.compteur) {
        meters.push(contract.compteur);
      }
    }
    
    metersWithData.value = meters;
    
    // Si des compteurs sont disponibles, sélectionner le premier par défaut
    if (meters.length > 0) {
      selectedMeter.value = meters[0].id;
      await loadMeterConsumption(selectedMeter.value);
    }
  } catch (err) {
    console.error('Erreur lors du chargement des compteurs:', err);
  } finally {
    loadingMeters.value = false;
  }
};

// Récupérer l'historique de consommation d'un compteur
const loadMeterConsumption = async (meterId) => {
  if (!meterId) return;
  
  try {
    if (!meterConsumptionData.value[meterId]) {
      const history = await analyticsStore.fetchMeterConsumption(meterId);
      meterConsumptionData.value[meterId] = history || [];
      
      // Calculer la consommation entre chaque relevé
      if (meterConsumptionData.value[meterId].length > 1) {
        const sortedData = [...meterConsumptionData.value[meterId]].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        for (let i = 1; i < sortedData.length; i++) {
          const prev = sortedData[i-1];
          const curr = sortedData[i];
          curr.consommation = curr.valeur - prev.valeur;
        }
        
        meterConsumptionData.value[meterId] = sortedData;
      }
    }
  } catch (err) {
    console.error(`Erreur lors du chargement de la consommation pour le compteur ${meterId}:`, err);
  }
};

// Valeurs calculées
const clientName = computed(() => {
  if (!client.value) return '';
  
  if (client.value.type === 'PARTICULIER') {
    return `${client.value.prenom || ''} ${client.value.nom || ''}`.trim();
  } else {
    return client.value.raisonSociale || '';
  }
});

const hasMeters = computed(() => metersWithData.value.length > 0);
const hasInvoices = computed(() => invoices.value.length > 0);
const hasBanking = computed(() => banking.value.length > 0);

const sortedConsumptionData = computed(() => {
  if (!selectedMeter.value || !meterConsumptionData.value[selectedMeter.value]) return [];
  
  return [...meterConsumptionData.value[selectedMeter.value]].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
});

// Données pour le graphique de consommation
const consumptionChartData = computed(() => {
  if (!selectedMeter.value || !meterConsumptionData.value[selectedMeter.value]) return null;
  
  const data = [...meterConsumptionData.value[selectedMeter.value]]
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return {
    labels: data.map(item => format(new Date(item.date), 'dd/MM/yyyy')),
    datasets: [
      {
        label: 'Relevé',
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        data: data.map(item => item.valeur),
        yAxisID: 'y',
      },
      {
        label: 'Consommation',
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        data: data.map(item => item.consommation || null),
        yAxisID: 'y1',
      }
    ]
  };
});

const consumptionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      position: 'left',
      title: {
        display: true,
        text: 'Relevé'
      }
    },
    y1: {
      position: 'right',
      title: {
        display: true,
        text: 'Consommation'
      },
      grid: {
        drawOnChartArea: false
      }
    }
  }
};

// Fonctions utilitaires
const formatContractType = (type) => {
  const typeMap = {
    'I': 'Individuel',
    'P': 'Professionnel',
    'C': 'Collectivité',
    'A': 'Association'
  };
  return typeMap[type] || type;
};

const formatStatus = (status) => {
  const statusMap = {
    'DRAFT': 'Brouillon',
    'WAITING_SIGNATURE': 'En attente de signature',
    'ACTIF': 'Actif',
    'TERMINE': 'Terminé',
    'RESILIE': 'Résilié',
    'SUSPENDU': 'Suspendu'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const statusClassMap = {
    'DRAFT': 'bg-gray-100 text-gray-800',
    'WAITING_SIGNATURE': 'bg-yellow-100 text-yellow-800',
    'ACTIF': 'bg-green-100 text-green-800',
    'TERMINE': 'bg-blue-100 text-blue-800',
    'RESILIE': 'bg-red-100 text-red-800',
    'SUSPENDU': 'bg-orange-100 text-orange-800'
  };
  return statusClassMap[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    return dateString;
  }
};

// Fonction pour éditer le client
const editClient = () => {
  router.push(`/clients/${client.value.id}/edit`);
};

// Observer les changements de compteur sélectionné
watch(selectedMeter, async (newMeterId) => {
  if (newMeterId && !meterConsumptionData.value[newMeterId]) {
    await loadMeterConsumption(newMeterId);
  }
});

// Observer les changements d'onglet
watch(activeTab, async (newTab) => {
  if (newTab === 'contracts' && clientContracts.value.length === 0) {
    await loadClientContracts();
    await loadClientContractsV2();
  } else if (newTab === 'meters' && metersWithData.value.length === 0) {
    await loadMeters();
  } else if (newTab === 'invoices' && invoices.value.length === 0) {
    await loadClientInvoices();
  } else if (newTab === 'banking' && banking.value.length === 0) {
    await loadClientBanking();
  }
});

// Initialisation
onMounted(async () => {
  await loadClient();
  if (client.value) {
    await loadClientContracts();
    await loadClientContractsV2();
    
    // Charger les données pour l'onglet actif
    if (activeTab.value === 'invoices') {
      await loadClientInvoices();
    } else if (activeTab.value === 'banking') {
      await loadClientBanking();
    }
  }
});
</script>
