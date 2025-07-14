<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- En-tête avec actions -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div class="flex items-center gap-2 text-sm text-blue-600 mb-2">
            <router-link to="/dashboard/compteurs" class="hover:underline flex items-center">
              <i class="fas fa-arrow-left mr-1"></i> Retour aux compteurs
            </router-link>
          </div>
          <h1 class="text-3xl font-extrabold text-blue-800 flex items-center gap-2">
            <i class="fas fa-tachometer-alt"></i> 
            <span v-if="meter">Compteur {{ meter.numero }}</span>
            <span v-else>Détails du compteur</span>
          </h1>
        </div>
        <div class="flex gap-2 mt-4 md:mt-0">
          <button 
            v-if="meter && meter.statut !== 'DÉFECTUEUX'"
            @click="signalDefectueux" 
            class="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition flex items-center gap-1">
            <i class="fas fa-exclamation-triangle"></i>
            Signaler défectueux
          </button>
          <button 
            v-if="meter"
            @click="editMeter" 
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1">
            <i class="fas fa-edit"></i>
            Modifier
          </button>
        </div>
      </div>

      <!-- État de chargement -->
      <div v-if="isLoading" class="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
        <p class="text-gray-500">Chargement des informations du compteur...</p>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center">
        <div class="bg-red-100 text-red-600 p-4 rounded-lg mb-4 w-full max-w-lg">
          <div class="font-bold mb-1 flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i> Erreur
          </div>
          <p>{{ error }}</p>
        </div>
        <button 
          @click="loadMeter"
          class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
          Réessayer
        </button>
      </div>

      <!-- Contenu principal -->
      <div v-else-if="meter" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Informations générales -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden lg:col-span-2">
          <div class="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h2 class="text-xl font-semibold text-blue-800">Informations générales</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Colonne gauche -->
              <div>
                <dl class="space-y-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Numéro de compteur</dt>
                    <dd class="text-base font-semibold text-gray-900 mt-1">{{ meter.numero }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Numéro de série</dt>
                    <dd class="text-base font-semibold text-gray-900 mt-1">{{ meter.serialNumber }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Calibre</dt>
                    <dd class="text-base font-semibold text-gray-900 mt-1">{{ meter.calibre }} mm</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Statut</dt>
                    <dd class="text-base mt-1">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(meter.statut)">
                        {{ getStatusLabel(meter.statut) }}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
              
              <!-- Colonne droite -->
              <div>
                <dl class="space-y-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Marque</dt>
                    <dd class="text-base font-semibold text-gray-900 mt-1">{{ meter.marque || '-' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Modèle</dt>
                    <dd class="text-base font-semibold text-gray-900 mt-1">{{ meter.modele || '-' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Date de fabrication</dt>
                    <dd class="text-base font-semibold text-gray-900 mt-1">{{ formatDate(meter.dateFabrication) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Date d'installation</dt>
                    <dd class="text-base font-semibold text-gray-900 mt-1">{{ formatDate(meter.dateInstallation) }}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <!-- Dernière lecture -->
            <div class="mt-8 border-t pt-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Dernière lecture</h3>
              <div v-if="meter.dernierReleve" class="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-500">Date</div>
                  <div class="text-lg font-medium">{{ formatDate(meter.dernierReleve.date) }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    <span :class="{'text-green-600': meter.dernierReleve.type === 'AUTO', 'text-orange-600': meter.dernierReleve.type === 'MANUEL'}">
                      <i :class="{'fas fa-robot': meter.dernierReleve.type === 'AUTO', 'fas fa-user': meter.dernierReleve.type === 'MANUEL'}"></i>
                      {{ meter.dernierReleve.type === 'AUTO' ? 'Télérelève' : 'Relevé manuel' }}
                    </span>
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-500">Valeur</div>
                  <div class="text-2xl font-bold text-blue-800">{{ meter.dernierReleve.valeur }} m³</div>
                </div>
                <button @click="addNewReading" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1">
                  <i class="fas fa-plus-circle"></i>
                  Nouveau relevé
                </button>
              </div>
              <div v-else class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-gray-500">Aucune lecture enregistrée</p>
                <button @click="addNewReading" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition mt-2 flex items-center gap-1 mx-auto">
                  <i class="fas fa-plus-circle"></i>
                  Ajouter un relevé
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Emplacement et informations associées -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 class="text-xl font-semibold text-blue-800">Emplacement</h2>
            </div>
            <div class="p-6">
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Adresse</dt>
                  <dd v-if="meter.adresse" class="text-base font-semibold text-gray-900 mt-1">
                    {{ meter.adresse.rue }}<br>
                    {{ meter.adresse.codePostal }} {{ meter.adresse.ville }}
                  </dd>
                  <dd v-else class="text-base text-gray-500 mt-1">Non installé</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 class="text-xl font-semibold text-blue-800">Client associé</h2>
            </div>
            <div class="p-6">
              <div v-if="meter.clientId" class="space-y-3">
                <div>
                  <div class="text-sm font-medium text-gray-500">Client</div>
                  <div class="text-base font-semibold text-gray-900 mt-1">
                    {{ meter.clientPrenom }} {{ meter.clientNom }}
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500">Contrat</div>
                  <div class="text-base font-semibold text-blue-800 mt-1">
                    <router-link :to="`/dashboard/contrats/${meter.contratId}`" class="hover:underline flex items-center">
                      {{ meter.contratNumero }}
                      <i class="fas fa-external-link-alt text-xs ml-1"></i>
                    </router-link>
                  </div>
                </div>
                <div class="pt-3 mt-3 border-t">
                  <router-link 
                    :to="`/dashboard/clients/${meter.clientId}/details`" 
                    class="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Voir la fiche client
                    <i class="fas fa-chevron-right text-xs ml-1"></i>
                  </router-link>
                </div>
              </div>
              <div v-else class="text-gray-500">Aucun client associé</div>
            </div>
          </div>
        </div>

        <!-- Historique de consommation -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden lg:col-span-3">
          <div class="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
            <h2 class="text-xl font-semibold text-blue-800">Historique de consommation</h2>
            <div class="flex gap-2">
              <button class="px-3 py-1 rounded bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 transition text-sm">
                Exporter
              </button>
              <button class="px-3 py-1 rounded bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 transition text-sm">
                Graphique
              </button>
            </div>
          </div>
          <div class="p-6">
            <div v-if="meter.historique && meter.historique.length > 0">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur (m³)</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consommation</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr v-for="(record, index) in meter.historique" :key="index" class="hover:bg-blue-50 transition">
                    <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(record.date) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="{'text-green-600': record.type === 'AUTO', 'text-orange-600': record.type === 'MANUEL'}">
                        <i :class="{'fas fa-robot': record.type === 'AUTO', 'fas fa-user': record.type === 'MANUEL'}" class="mr-1"></i>
                        {{ record.type === 'AUTO' ? 'Télérelève' : 'Manuel' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium">{{ record.valeur }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span v-if="record.consommation" :class="getConsommationClass(record.consommation)">
                        {{ record.consommation }} m³
                      </span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              Aucun historique de consommation disponible
            </div>
          </div>
        </div>
        
        <!-- Interventions -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden lg:col-span-3" v-if="meter.interventions && meter.interventions.length > 0">
          <div class="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
            <h2 class="text-xl font-semibold text-blue-800">Interventions</h2>
            <button 
              @click="planifyIntervention" 
              class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-sm flex items-center gap-1"
            >
              <i class="fas fa-plus"></i>
              Planifier
            </button>
          </div>
          <div class="p-6">
            <div class="divide-y divide-gray-200">
              <div 
                v-for="(intervention, index) in meter.interventions" 
                :key="index" 
                class="py-4 first:pt-0 last:pb-0"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getInterventionTypeClass(intervention.type)">
                        {{ getInterventionTypeLabel(intervention.type) }}
                      </span>
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getInterventionStatusClass(intervention.statut)">
                        {{ getInterventionStatusLabel(intervention.statut) }}
                      </span>
                    </div>
                    <h4 class="font-medium text-lg mt-1">{{ formatDate(intervention.date) }}</h4>
                    <p v-if="intervention.commentaire" class="text-gray-600 mt-1">
                      {{ intervention.commentaire }}
                    </p>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-500">Technicien</div>
                    <div class="font-medium">{{ intervention.technicienNom }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useMeterStore } from '@/stores/meter.store';
import { useNotificationStore } from '@/stores/notification.store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const route = useRoute();
const router = useRouter();
const meterStore = useMeterStore();
const notificationStore = useNotificationStore();

// États réactifs depuis le store
const { currentMeter: meter, isLoading } = storeToRefs(meterStore);
const error = ref(null);

// Chargement initial
onMounted(() => {
  loadMeter();
});

// Méthodes
const loadMeter = async () => {
  const meterId = route.params.id;
  error.value = null;
  try {
    await meterStore.getMeterById(meterId);
  } catch (err) {
    error.value = err.message || 'Erreur lors du chargement du compteur';
    console.error('Erreur chargement compteur:', err);
  }
};

const editMeter = () => {
  router.push(`/dashboard/compteurs/${route.params.id}/edit`);
};

const signalDefectueux = async () => {
  try {
    // TODO: API call to signal meter as defective
    notificationStore.success('Succès', 'Le compteur a été signalé comme défectueux');
    await loadMeter(); // Recharge les données du compteur
  } catch (err) {
    notificationStore.error('Erreur', err.message || 'Erreur lors du signalement du compteur défectueux');
  }
};

const addNewReading = () => {
  // TODO: Implement modal or redirect to add new reading
  notificationStore.info('Info', 'Cette fonctionnalité sera bientôt disponible');
};

const planifyIntervention = () => {
  router.push({
    path: '/dashboard/interventions/create',
    query: { meterId: route.params.id }
  });
};

// Utilitaires
const getStatusClass = (statut) => {
  switch (statut) {
    case 'ACTIF':
      return 'bg-green-100 text-green-800';
    case 'EN_STOCK':
      return 'bg-blue-100 text-blue-800';
    case 'INSTALLÉ':
      return 'bg-purple-100 text-purple-800';
    case 'DÉFECTUEUX':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (statut) => {
  switch (statut) {
    case 'ACTIF':
      return 'Actif';
    case 'EN_STOCK':
      return 'En stock';
    case 'INSTALLÉ':
      return 'Installé';
    case 'DÉFECTUEUX':
      return 'Défectueux';
    default:
      return statut;
  }
};

const getConsommationClass = (consommation) => {
  if (consommation > 40) return 'text-red-600 font-medium';
  if (consommation > 25) return 'text-orange-600 font-medium';
  return 'text-green-600';
};

const getInterventionTypeClass = (type) => {
  switch (type) {
    case 'INSTALLATION':
      return 'bg-blue-100 text-blue-800';
    case 'MAINTENANCE':
      return 'bg-yellow-100 text-yellow-800';
    case 'REMPLACEMENT':
      return 'bg-purple-100 text-purple-800';
    case 'RELEVE':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getInterventionTypeLabel = (type) => {
  switch (type) {
    case 'INSTALLATION':
      return 'Installation';
    case 'MAINTENANCE':
      return 'Maintenance';
    case 'REMPLACEMENT':
      return 'Remplacement';
    case 'RELEVE':
      return 'Relevé';
    default:
      return type;
  }
};

const getInterventionStatusClass = (statut) => {
  switch (statut) {
    case 'PLANIFIEE':
      return 'bg-blue-100 text-blue-800';
    case 'EN_COURS':
      return 'bg-yellow-100 text-yellow-800';
    case 'TERMINEE':
      return 'bg-green-100 text-green-800';
    case 'ANNULEE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getInterventionStatusLabel = (statut) => {
  switch (statut) {
    case 'PLANIFIEE':
      return 'Planifiée';
    case 'EN_COURS':
      return 'En cours';
    case 'TERMINEE':
      return 'Terminée';
    case 'ANNULEE':
      return 'Annulée';
    default:
      return statut;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  } catch (e) {
    return dateString;
  }
};
</script>
