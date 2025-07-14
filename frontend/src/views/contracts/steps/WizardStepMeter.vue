<template>
  <div class="step-container">
    <h2>Compteur</h2>
    <!-- Affichage de débogage -->
    <div class="bg-gray-100 p-2 mb-4 text-xs" v-if="debug">
      <div><strong>hasMeter:</strong> {{ hasMeter }}</div>
      <div><strong>meterId:</strong> {{ meterId }}</div>
      <div><strong>formData.meter:</strong> {{ formData.meter ? JSON.stringify(formData.meter) : 'undefined' }}</div>
      <div><strong>generatedMeter:</strong> {{ generatedMeter ? JSON.stringify(generatedMeter) : 'null' }}</div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Choix compteur existant ou non -->
      <div>
        <label class="block mb-2 font-medium">Le logement dispose-t-il déjà d'un compteur opérationnel ?</label>
        <div class="flex items-center space-x-4">
          <label class="inline-flex items-center">
            <input type="radio" v-model="hasMeter" :value="true" />
            <span class="ml-1">Oui</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" v-model="hasMeter" :value="false" />
            <span class="ml-1">Non</span>
          </label>
        </div>
      </div>

      <div v-if="hasMeter" class="space-y-4">
        <label class="block font-medium">Sélectionner le compteur</label>
        <input
          v-model="meterId"
          type="text"
          placeholder="UUID du compteur ou numéro de série"
          class="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <!-- Section compteur virtuel généré -->
      <div v-else-if="!!formData.meter?.compteurId" class="bg-green-50 border border-green-300 rounded p-4 text-sm">
        <div class="font-semibold mb-2">Compteur virtuel généré automatiquement :</div>
        <div><span class="font-medium">ID:</span> {{ formData.meter.compteurId }}</div>
        <div v-if="formData.meter.numero"><span class="font-medium">Numéro:</span> {{ formData.meter.numero }}</div>
        <div v-if="formData.meter.statut"><span class="font-medium">Statut:</span> {{ formData.meter.statut }}</div>
        <div class="mt-2 text-green-700">Une intervention d'installation sera programmée à la finalisation du contrat.</div>
      </div>

      <div v-else class="bg-yellow-50 border border-yellow-300 rounded p-4 text-sm">
        Aucun compteur existant : une intervention de pose sera générée automatiquement à la finalisation du contrat.
      </div>

      <div class="flex justify-between pt-6">
        <button type="button" class="btn" @click="$emit('previous')">Précédent</button>
        <button type="submit" class="btn-primary" :disabled="isLoading">Suivant</button>
      </div>
      <div v-if="error" class="text-red-500">{{ error }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { toRefs } from 'vue'
import { useMeterStore } from '@/stores/meter.store'

interface Props {
  formData: any
}

// Activation du mode débogage (afficher/masquer les informations de débogage)
const debug = ref(true)

const props = defineProps<Props>()
const emit = defineEmits(['update:formData', 'next', 'previous'])

// Instance du store compteur
const meterStore = useMeterStore()

// Extraire les props dans des refs
const { formData } = toRefs(props)

// Log au montage du composant pour voir le contenu de formData
onMounted(() => {
  console.log(' WizardStepMeter - formData au montage:', JSON.stringify(formData.value))
})

// On initialise avec les valeurs du store, mais on vérifie d'abord la présence d'un compteur généré
const hasMeterInitial = computed(() => {
  // Log pour déboguer
  console.log(' Calcul de hasMeterInitial:')
  console.log('- formData.meter?.hasMeter:', formData.value.meter?.hasMeter)
  console.log('- formData.meter?.compteurId:', formData.value.meter?.compteurId)
  
  // Si un compteur a été généré automatiquement, on considère que hasMeter = false
  if (formData.value.meter?.compteurId && formData.value.meter?.hasMeter !== true) {
    console.log('→ Compteur généré détecté, hasMeter = false')
    return false
  }
  // Sinon on prend la valeur du formData ou true par défaut
  console.log('→ Utilisation de la valeur par défaut:', formData.value.meter?.hasMeter ?? true)
  return formData.value.meter?.hasMeter ?? true
})

const hasMeter = ref(hasMeterInitial.value)
const meterId = ref(formData.value.meter?.compteurId ?? '')

// Cette propriété calculée détecte si un compteur a été généré automatiquement
const generatedMeter = computed(() => {
  console.log(' Calcul de generatedMeter:')
  console.log('- hasMeter:', hasMeter.value)
  console.log('- formData.meter:', formData.value.meter)
  
  if (!hasMeter.value && formData.value.meter && formData.value.meter.compteurId) {
    console.log('→ Compteur généré trouvé!')
    return {
      compteurId: formData.value.meter.compteurId,
      numero: formData.value.meter.numero,
      statut: formData.value.meter.statut || 'EN_ATTENTE_INSTALLATION',
      type: formData.value.meter.type
    }
  }
  
  console.log('→ Aucun compteur généré détecté')
  return null
})

// Observer les changements dans formData pour mise à jour en temps réel
watch(() => formData.value, (newFormData) => {
  console.log(' formData changé:', JSON.stringify(newFormData.meter))
  
  if (newFormData.meter?.compteurId && !hasMeter.value) {
    console.log('→ Compteur détecté dans watch!')
  }
}, { deep: true })

// Observer les changements de hasMeter pour effacer meterId si nécessaire
watch(hasMeter, (val) => {
  console.log(' hasMeter changé:', val)
  if (!val) meterId.value = ''
})

const isLoading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  console.log(' handleSubmit avec hasMeter =', hasMeter.value)
  error.value = ''
  isLoading.value = true
  
  try {
    // Cas où il n'y a pas de compteur existant : générer un compteur virtuel
    if (!hasMeter.value) {
      console.log('→ Génération d\'un compteur virtuel via le store')
      
      // Préparer les données pour la génération du compteur virtuel
      const meterData = {
        zone: formData.value.eligibility?.zone || '',
        adresse: formData.value.eligibility?.adresse || {}
      }
      
      // Utiliser le store pour générer un compteur virtuel
      const result = await meterStore.generateVirtualMeter(meterData)
      console.log('→ Résultat de la génération du compteur:', result)
      
      if (result.success && result.data) {
        // Stocker les informations du compteur généré
        const generatedMeterData = {
          hasMeter: false,
          compteurId: result.data.id,
          numero: result.data.numero || result.data.serial,
          statut: result.data.statut || 'ACTIF',
          type: result.data.type || 'VIRTUEL'
        }
        
        console.log('→ Mise à jour des données avec le compteur généré:', generatedMeterData)
        emit('update:formData', { meter: generatedMeterData })
      } else {
        throw new Error(result.error || 'Erreur lors de la génération du compteur virtuel')
      }
    } else {
      // Cas où un compteur existe déjà
      const meterData = {
        hasMeter: hasMeter.value,
        compteurId: meterId.value
      }
      
      // Si un compteur existe dans formData et que hasMeter est false, l'utiliser
      if (formData.value.meter?.compteurId && !hasMeter.value) {
        Object.assign(meterData, {
          compteurId: formData.value.meter.compteurId,
          numero: formData.value.meter.numero,
          statut: formData.value.meter.statut,
          type: formData.value.meter.type
        })
        console.log('→ Utilisation du compteur généré:', meterData)
      }
      
      emit('update:formData', { meter: meterData })
    }
    
    // Passer à l'étape suivante
    emit('next')
  } catch (e) {
    console.error('Erreur lors de la soumission du formulaire:', e)
    error.value = e.message || 'Une erreur est survenue lors de la création du compteur'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 rounded bg-white text-sm;
}
.btn-primary {
  @apply inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700;
}
</style>
