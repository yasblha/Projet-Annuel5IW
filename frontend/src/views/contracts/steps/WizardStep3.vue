<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Visite terrain</h2>
      <p class="text-gray-600">Planifiez la visite et scannez le numéro de série du compteur</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Calendrier de visite -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Planification de la visite</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date de visite *
              </label>
              <input
                v-model="visitDate"
                type="date"
                :min="minVisitDate"
                :class="[
                  'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.visitDate ? 'border-red-500' : 'border-gray-300'
                ]"
                required
              />
              <p v-if="errors.visitDate" class="mt-1 text-sm text-red-600">
                {{ errors.visitDate }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Heure de visite *
              </label>
              <select
                v-model="visitTime"
                :class="[
                  'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.visitTime ? 'border-red-500' : 'border-gray-300'
                ]"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
              </select>
              <p v-if="errors.visitTime" class="mt-1 text-sm text-red-600">
                {{ errors.visitTime }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Technicien assigné
              </label>
              <select
                v-model="assignedTechnician"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un technicien...</option>
                <option value="tech1">Jean Dupont</option>
                <option value="tech2">Marie Martin</option>
                <option value="tech3">Pierre Durand</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Statut de la visite -->
        <div v-if="visitStatus" class="p-4 rounded-md" :class="visitStatusClass">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg v-if="visitStatus === 'completed'" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg v-else-if="visitStatus === 'scheduled'" class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium" :class="visitStatusTextClass">
                {{ visitStatusText }}
              </h3>
              <div class="mt-2 text-sm" :class="visitStatusTextClass">
                <p>{{ visitStatusMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scan compteur -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Scan du compteur</h3>
          
          <!-- Mode de saisie -->
          <div class="mb-4">
            <div class="flex space-x-4">
              <button
                type="button"
                @click="scanMode = 'qr'"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md',
                  scanMode === 'qr' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1z"></path>
                </svg>
                Scan QR
              </button>
              <button
                type="button"
                @click="scanMode = 'manual'"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md',
                  scanMode === 'manual' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Saisie manuelle
              </button>
            </div>
          </div>

          <!-- Zone de scan -->
          <div v-if="scanMode === 'qr'" class="space-y-4">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div v-if="!isScanning" class="space-y-4">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div>
                  <button
                    type="button"
                    @click="startScan"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1z"></path>
                    </svg>
                    Démarrer le scan
                  </button>
                </div>
                <p class="text-sm text-gray-500">
                  Positionnez le QR code dans le cadre
                </p>
              </div>
              
              <div v-else class="space-y-4">
                <div class="relative">
                  <video ref="videoRef" class="w-full h-64 object-cover rounded-lg"></video>
                  <div class="absolute inset-0 border-2 border-blue-500 rounded-lg"></div>
                </div>
                <button
                  type="button"
                  @click="stopScan"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Arrêter le scan
                </button>
              </div>
            </div>
          </div>

          <!-- Saisie manuelle -->
          <div v-else class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Numéro de série *
              </label>
              <input
                v-model="form.numeroSerie"
                type="text"
                placeholder="Ex: 0723456"
                :class="[
                  'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.numeroSerie ? 'border-red-500' : 'border-gray-300'
                ]"
                required
              />
              <p v-if="errors.numeroSerie" class="mt-1 text-sm text-red-600">
                {{ errors.numeroSerie }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Calibre *
              </label>
              <input
                v-model="form.calibre"
                type="text"
                placeholder="Ex: 40"
                :class="[
                  'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.calibre ? 'border-red-500' : 'border-gray-300'
                ]"
                required
              />
              <p v-if="errors.calibre" class="mt-1 text-sm text-red-600">
                {{ errors.calibre }}
              </p>
            </div>
          </div>
        </div>

        <!-- Informations compteur -->
        <div v-if="meterInfo" class="p-4 bg-green-50 border border-green-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Compteur trouvé
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p><strong>Numéro:</strong> {{ meterInfo.numero }}</p>
                <p><strong>Calibre:</strong> {{ meterInfo.calibre }}</p>
                <p><strong>Statut:</strong> {{ meterInfo.statut }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between mt-8">
      <button 
        type="button" 
        @click="$emit('previous')"
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Précédent
      </button>
      
      <button 
        type="submit"
        @click="handleSubmit"
        :disabled="!isValid || isLoading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? 'Chargement...' : 'Suivant' }}
        <svg class="-mr-1 ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
    <p v-if="submitError" class="text-center mt-4 text-red-600 text-sm">{{ submitError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { z } from 'zod'
import { meterApi } from '@/services/api/meter.service'

// Props & Emits
const props = defineProps<{
  formData: any
}>()

const emit = defineEmits<{
  'update:formData': [data: any]
  'next': []
  'previous': []
}>()

// Reactive state
const form = ref({
  numeroSerie: '',
  calibre: '',
  coordonnees: null
})

const visitDate = ref('')
const visitTime = ref('')
const assignedTechnician = ref('')
const scanMode = ref<'qr' | 'manual'>('qr')
const isScanning = ref(false)
const visitStatus = ref<'scheduled' | 'completed' | null>(null)
const meterInfo = ref<any>(null)
const isLoading = ref(false)
const submitError = ref('')
const errors = ref<Record<string, string>>({})

// Refs
const videoRef = ref<HTMLVideoElement>()

// Validation schema
const MeterScanSchema = z.object({
  numeroSerie: z.string().min(7, 'Numéro de série invalide'),
  calibre: z.string().regex(/^\d{2,3}$/, 'Calibre invalide'),
  coordonnees: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional()
})

// Computed
const isValid = computed(() => {
  try {
    MeterScanSchema.parse(form.value)
    return visitDate.value && visitTime.value
  } catch {
    return false
  }
})

const minVisitDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const visitStatusClass = computed(() => {
  switch (visitStatus.value) {
    case 'completed':
      return 'bg-green-50 border border-green-200'
    case 'scheduled':
      return 'bg-blue-50 border border-blue-200'
    default:
      return ''
  }
})

const visitStatusTextClass = computed(() => {
  switch (visitStatus.value) {
    case 'completed':
      return 'text-green-800'
    case 'scheduled':
      return 'text-blue-800'
    default:
      return ''
  }
})

const visitStatusText = computed(() => {
  switch (visitStatus.value) {
    case 'completed':
      return 'Visite terminée'
    case 'scheduled':
      return 'Visite planifiée'
    default:
      return ''
  }
})

const visitStatusMessage = computed(() => {
  switch (visitStatus.value) {
    case 'completed':
      return 'Le compteur a été installé avec succès.'
    case 'scheduled':
      return `Visite prévue le ${visitDate.value} à ${visitTime.value}.`
    default:
      return ''
  }
})

// Methods
const startScan = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      isScanning.value = true
    }
  } catch (error) {
    console.error('Erreur accès caméra:', error)
  }
}

const stopScan = () => {
  if (videoRef.value?.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    isScanning.value = false
  }
}

const validateForm = () => {
  try {
    MeterScanSchema.parse(form.value)
    errors.value = {}
    if (!visitDate.value) {
      errors.value.visitDate = 'Date requise'
      return false
    }
    if (!visitTime.value) {
      errors.value.visitTime = 'Heure requise'
      return false
    }
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = {}
      error.errors.forEach(err => {
        if (err.path[0]) {
          errors.value[err.path[0] as string] = err.message
        }
      })
    }
    return false
  }
}

const handleSubmit = async () => {
  submitError.value = ''
  if (!validateForm()) {
    submitError.value = 'Veuillez corriger les erreurs du formulaire.'
    return
  }
  
  isLoading.value = true
  try {
    // Création réelle du compteur via l'API au lieu de simuler
    const meterData = {
      numeroSerie: form.value.numeroSerie,
      calibre: form.value.calibre,
      coordonnees: form.value.coordonnees,
      zone: props.formData?.eligibility?.zone,
      adresse: props.formData?.eligibility?.adresse
    }
    
    // Génération d'un compteur virtuel via l'API
    const response = await meterApi.generateVirtualMeter(meterData)
    
    if (!response || !response.id) {
      throw new Error('Échec de création du compteur virtuel')
    }
    
    // Stocker les informations du compteur retournées par l'API
    meterInfo.value = {
      numero: response.numero,
      calibre: form.value.calibre,
      statut: response.statut || 'ACTIF',
      id: response.id
    }
    
    visitStatus.value = 'completed'
    
    // Mettre à jour les données du formulaire avec l'ID réel du compteur
    emit('update:formData', { 
      meterScan: {
        ...form.value,
        compteurId: response.id
      }
    })
    emit('next')
  } catch (error) {
    console.error('Erreur création compteur:', error)
    submitError.value = 'Erreur lors de la création du compteur. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Planifier une visite par défaut
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  visitDate.value = tomorrow.toISOString().split('T')[0]
  visitTime.value = '10:00'
  visitStatus.value = 'scheduled'
})

onUnmounted(() => {
  stopScan()
})

// Watch for form data changes
watch(() => props.formData?.meterScan, (newData) => {
  if (newData) {
    form.value = { ...form.value, ...newData }
  }
}, { immediate: true })
</script> 