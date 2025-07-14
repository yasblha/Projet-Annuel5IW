<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
    <div class="max-w-5xl mx-auto">
      <!-- En-tête -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div class="flex items-center gap-2 text-sm text-blue-600 mb-2">
            <router-link :to="`/dashboard/compteurs/${meterId}`" class="hover:underline flex items-center">
              <i class="fas fa-arrow-left mr-1"></i> Retour au détail du compteur
            </router-link>
          </div>
          <h1 class="text-3xl font-extrabold text-blue-800 flex items-center gap-2">
            <i class="fas fa-tachometer-alt"></i> 
            <span v-if="isEditMode">Modifier le compteur</span>
            <span v-else>Ajouter un compteur</span>
          </h1>
        </div>
      </div>

      <!-- État de chargement -->
      <div v-if="isLoading" class="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center">
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
        <p class="text-gray-500">Chargement des informations...</p>
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

      <!-- Formulaire d'édition -->
      <form v-else @submit.prevent="saveMeter" class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h2 class="text-xl font-semibold text-blue-800">
            {{ isEditMode ? 'Modifier les informations du compteur' : 'Informations du nouveau compteur' }}
          </h2>
        </div>

        <div class="p-6 space-y-8">
          <!-- Informations générales -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Numéro du compteur <span class="text-red-600">*</span>
                </label>
                <input 
                  type="text" 
                  v-model="formData.numero" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  :class="{ 'border-red-500': validationErrors.numero }"
                  required
                />
                <p v-if="validationErrors.numero" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.numero }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de série <span class="text-red-600">*</span>
                </label>
                <input 
                  type="text" 
                  v-model="formData.serialNumber" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  :class="{ 'border-red-500': validationErrors.serialNumber }"
                  required
                />
                <p v-if="validationErrors.serialNumber" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.serialNumber }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Calibre (mm) <span class="text-red-600">*</span>
                </label>
                <select 
                  v-model="formData.calibre" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  :class="{ 'border-red-500': validationErrors.calibre }"
                  required
                >
                  <option value="">Sélectionnez un calibre</option>
                  <option value="15">15 mm</option>
                  <option value="20">20 mm</option>
                  <option value="25">25 mm</option>
                  <option value="32">32 mm</option>
                  <option value="40">40 mm</option>
                </select>
                <p v-if="validationErrors.calibre" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.calibre }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Statut <span class="text-red-600">*</span>
                </label>
                <select 
                  v-model="formData.statut" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  :class="{ 'border-red-500': validationErrors.statut }"
                  required
                >
                  <option value="">Sélectionnez un statut</option>
                  <option value="ACTIF">Actif</option>
                  <option value="EN_STOCK">En stock</option>
                  <option value="INSTALLÉ">Installé</option>
                  <option value="DÉFECTUEUX">Défectueux</option>
                </select>
                <p v-if="validationErrors.statut" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.statut }}
                </p>
              </div>
            </div>
          </div>

          <!-- Spécifications techniques -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Spécifications techniques</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                <input 
                  type="text" 
                  v-model="formData.marque" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                <input 
                  type="text" 
                  v-model="formData.modele" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date de fabrication</label>
                <input 
                  type="date" 
                  v-model="formData.dateFabrication" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date d'installation</label>
                <input 
                  type="date" 
                  v-model="formData.dateInstallation" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  :disabled="formData.statut !== 'INSTALLÉ'"
                />
                <p v-if="formData.statut === 'INSTALLÉ' && !formData.dateInstallation" class="mt-1 text-sm text-amber-600">
                  <i class="fas fa-info-circle mr-1"></i> Une date d'installation est requise pour un compteur installé
                </p>
              </div>
            </div>
          </div>

          <!-- Emplacement -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Emplacement</h3>
            <div v-if="formData.statut === 'INSTALLÉ'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Rue</label>
                <input 
                  type="text" 
                  v-model="formData.adresse.rue" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  :class="{ 'border-red-500': validationErrors['adresse.rue'] }"
                />
                <p v-if="validationErrors['adresse.rue']" class="mt-1 text-sm text-red-600">
                  {{ validationErrors['adresse.rue'] }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                <input 
                  type="text" 
                  v-model="formData.adresse.codePostal" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  :class="{ 'border-red-500': validationErrors['adresse.codePostal'] }"
                />
                <p v-if="validationErrors['adresse.codePostal']" class="mt-1 text-sm text-red-600">
                  {{ validationErrors['adresse.codePostal'] }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input 
                  type="text" 
                  v-model="formData.adresse.ville" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  :class="{ 'border-red-500': validationErrors['adresse.ville'] }"
                />
                <p v-if="validationErrors['adresse.ville']" class="mt-1 text-sm text-red-600">
                  {{ validationErrors['adresse.ville'] }}
                </p>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              Information d'adresse disponible uniquement pour les compteurs installés
            </div>
          </div>

          <!-- Associer à un client/contrat -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Association client/contrat</h3>
            <div v-if="formData.statut === 'INSTALLÉ'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contrat associé</label>
                <select 
                  v-model="formData.contratId" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                  <option value="">Sélectionnez un contrat</option>
                  <option value="contract-1">Contrat #ABC123</option>
                  <option value="contract-2">Contrat #DEF456</option>
                  <option value="contract-3">Contrat #GHI789</option>
                </select>
                <p class="mt-1 text-xs text-gray-500">
                  L'association à un contrat remplira automatiquement les informations client
                </p>
              </div>

              <div v-if="formData.contratId" class="bg-blue-50 p-4 rounded-lg">
                <p class="text-blue-800 font-medium">Informations du contrat</p>
                <p class="text-sm mt-1">Client: {{ sampleClientName }}</p>
                <p class="text-sm">Adresse: {{ sampleAddress }}</p>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              Association disponible uniquement pour les compteurs installés
            </div>
          </div>

          <!-- Notes -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Notes</h3>
            <div>
              <textarea 
                v-model="formData.notes" 
                rows="3" 
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Ajoutez des notes ou commentaires sur ce compteur..."
              ></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t pt-6 flex justify-end gap-3">
            <button 
              type="button"
              @click="$router.back()"
              class="px-5 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Annuler
            </button>
            <button 
              type="submit"
              class="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
              :disabled="isSaving"
            >
              <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              {{ isEditMode ? 'Enregistrer les modifications' : 'Créer le compteur' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useMeterStore } from '@/stores/meter.store';
import { useNotificationStore } from '@/stores/notification.store';

const route = useRoute();
const router = useRouter();
const meterStore = useMeterStore();
const notificationStore = useNotificationStore();

// État du formulaire et de l'interface
const isLoading = ref(false);
const isSaving = ref(false);
const error = ref(null);
const validationErrors = ref({});
const meterId = computed(() => route.params.id);
const isEditMode = computed(() => !!meterId.value);

// Données du formulaire
const formData = reactive({
  numero: '',
  serialNumber: '',
  calibre: '',
  statut: '',
  marque: '',
  modele: '',
  dateFabrication: '',
  dateInstallation: '',
  adresse: {
    rue: '',
    codePostal: '',
    ville: ''
  },
  contratId: '',
  notes: ''
});

// Exemple de données pour la démo
const sampleClientName = computed(() => {
  if (formData.contratId === 'contract-1') return 'Martin Dupont';
  if (formData.contratId === 'contract-2') return 'Sophie Dubois';
  if (formData.contratId === 'contract-3') return 'Thomas Leroy';
  return '';
});

const sampleAddress = computed(() => {
  if (formData.contratId === 'contract-1') return '123 Rue du Commerce, 75001 Paris';
  if (formData.contratId === 'contract-2') return '45 Avenue des Fleurs, 69002 Lyon';
  if (formData.contratId === 'contract-3') return '8 Boulevard Maritime, 13008 Marseille';
  return '';
});

// Chargement initial
onMounted(async () => {
  if (isEditMode.value) {
    await loadMeter();
  }
});

// Observer les changements de statut pour gérer les champs conditionnels
watch(() => formData.statut, (newStatus) => {
  if (newStatus !== 'INSTALLÉ') {
    formData.dateInstallation = '';
    formData.adresse.rue = '';
    formData.adresse.codePostal = '';
    formData.adresse.ville = '';
    formData.contratId = '';
  }
});

// Méthodes
const loadMeter = async () => {
  if (!meterId.value) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    const meterData = await meterStore.getMeterById(meterId.value);
    
    // Remplir le formulaire avec les données du compteur
    Object.keys(formData).forEach(key => {
      if (key === 'adresse') {
        if (meterData.adresse) {
          formData.adresse.rue = meterData.adresse.rue || '';
          formData.adresse.codePostal = meterData.adresse.codePostal || '';
          formData.adresse.ville = meterData.adresse.ville || '';
        }
      } else if (meterData[key] !== undefined) {
        formData[key] = meterData[key];
      }
    });
    
  } catch (err) {
    error.value = err.message || "Erreur lors du chargement des données du compteur";
    console.error("Erreur chargement compteur:", err);
  } finally {
    isLoading.value = false;
  }
};

const validateForm = () => {
  validationErrors.value = {};
  let isValid = true;
  
  // Validation des champs requis
  if (!formData.numero) {
    validationErrors.value.numero = 'Le numéro du compteur est requis';
    isValid = false;
  }
  
  if (!formData.serialNumber) {
    validationErrors.value.serialNumber = 'Le numéro de série est requis';
    isValid = false;
  }
  
  if (!formData.calibre) {
    validationErrors.value.calibre = 'Le calibre est requis';
    isValid = false;
  }
  
  if (!formData.statut) {
    validationErrors.value.statut = 'Le statut est requis';
    isValid = false;
  }
  
  // Validation conditionnelle pour les compteurs installés
  if (formData.statut === 'INSTALLÉ') {
    if (!formData.dateInstallation) {
      validationErrors.value.dateInstallation = 'La date d\'installation est requise pour les compteurs installés';
      isValid = false;
    }
    
    if (!formData.adresse.rue) {
      validationErrors.value['adresse.rue'] = 'La rue est requise pour les compteurs installés';
      isValid = false;
    }
    
    if (!formData.adresse.codePostal) {
      validationErrors.value['adresse.codePostal'] = 'Le code postal est requis pour les compteurs installés';
      isValid = false;
    }
    
    if (!formData.adresse.ville) {
      validationErrors.value['adresse.ville'] = 'La ville est requise pour les compteurs installés';
      isValid = false;
    }
  }
  
  return isValid;
};

const saveMeter = async () => {
  if (!validateForm()) {
    notificationStore.error('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
    return;
  }
  
  isSaving.value = true;
  
  try {
    // Préparer les données à envoyer à l'API
    const meterData = { ...formData };
    
    // Si le compteur n'est pas installé, supprimer les données d'adresse
    if (meterData.statut !== 'INSTALLÉ') {
      delete meterData.adresse;
      delete meterData.contratId;
    }
    
    if (isEditMode.value) {
      // Mise à jour d'un compteur existant
      await meterStore.updateMeter(meterId.value, meterData);
      notificationStore.success('Succès', 'Compteur mis à jour avec succès');
    } else {
      // Création d'un nouveau compteur
      const newMeter = await meterStore.createMeter(meterData);
      notificationStore.success('Succès', 'Compteur créé avec succès');
      // Rediriger vers la page de détails du nouveau compteur
      router.push(`/dashboard/compteurs/${newMeter.id}`);
    }
  } catch (err) {
    notificationStore.error('Erreur', err.message || 'Erreur lors de l\'enregistrement du compteur');
    console.error('Erreur sauvegarde compteur:', err);
  } finally {
    isSaving.value = false;
  }
};
</script>
