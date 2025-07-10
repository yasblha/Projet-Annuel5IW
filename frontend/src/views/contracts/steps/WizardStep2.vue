<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Éligibilité & adresse</h2>
      <p class="text-gray-600">Vérifiez l'éligibilité et saisissez l'adresse d'installation</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Type de contrat -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Type de contrat *
          </label>
          <select 
            v-model="form.typeContrat"
            @change="handleTypeChange"
            :class="[
              'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.typeContrat ? 'border-red-500' : 'border-gray-300'
            ]"
            required
          >
            <option value="">Sélectionner...</option>
            <option value="I">Individuel</option>
            <option value="P">Particulier</option>
            <option value="C">Collectivité</option>
            <option value="A">Administration</option>
          </select>
          <p v-if="errors.typeContrat" class="mt-1 text-sm text-red-600">
            {{ errors.typeContrat }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Zone *
          </label>
          <select 
            v-model="form.zone"
            :class="[
              'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.zone ? 'border-red-500' : 'border-gray-300'
            ]"
            required
          >
            <option value="">Sélectionner...</option>
            <option value="TLS">Toulouse</option>
            <option value="PAR">Paris</option>
            <option value="MAR">Marseille</option>
            <option value="LYO">Lyon</option>
            <option value="NAN">Nantes</option>
            <option value="BOR">Bordeaux</option>
            <option value="MON">Montpellier</option>
            <option value="NIC">Nice</option>
            <option value="STR">Strasbourg</option>
            <option value="LIL">Lille</option>
          </select>
          <p v-if="errors.zone" class="mt-1 text-sm text-red-600">
            {{ errors.zone }}
          </p>
        </div>
      </div>

      <!-- Date de début -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Date de début *
        </label>
        <input
          v-model="form.dateDebut"
          type="date"
          :min="minDate"
          :max="maxDate"
          :class="[
            'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            errors.dateDebut ? 'border-red-500' : 'border-gray-300'
          ]"
          required
        />
        <p v-if="errors.dateDebut" class="mt-1 text-sm text-red-600">
          {{ errors.dateDebut }}
        </p>
      </div>

      <!-- Adresse -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Adresse d'installation</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rue *
            </label>
            <input
              v-model="form.adresse.rue"
              type="text"
              placeholder="123 Rue de la Paix"
              :class="[
                'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.adresse?.rue ? 'border-red-500' : 'border-gray-300'
              ]"
              required
            />
            <p v-if="errors.adresse?.rue" class="mt-1 text-sm text-red-600">
              {{ errors.adresse.rue }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Code postal *
            </label>
            <input
              v-model="form.adresse.codePostal"
              type="text"
              placeholder="75001"
              pattern="[0-9]{5}"
              :class="[
                'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.adresse?.codePostal ? 'border-red-500' : 'border-gray-300'
              ]"
              required
            />
            <p v-if="errors.adresse?.codePostal" class="mt-1 text-sm text-red-600">
              {{ errors.adresse.codePostal }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ville *
            </label>
            <input
              v-model="form.adresse.ville"
              type="text"
              placeholder="Paris"
              :class="[
                'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.adresse?.ville ? 'border-red-500' : 'border-gray-300'
              ]"
              required
            />
            <p v-if="errors.adresse?.ville" class="mt-1 text-sm text-red-600">
              {{ errors.adresse.ville }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pays
            </label>
            <input
              v-model="form.adresse.pays"
              type="text"
              value="France"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Simulation éligibilité -->
      <div v-if="eligibilityResult" class="mt-6 p-4 rounded-md" :class="eligibilityResult.isEligible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg v-if="eligibilityResult.isEligible" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium" :class="eligibilityResult.isEligible ? 'text-green-800' : 'text-red-800'">
              {{ eligibilityResult.isEligible ? 'Éligible' : 'Non éligible' }}
            </h3>
            <div class="mt-2 text-sm" :class="eligibilityResult.isEligible ? 'text-green-700' : 'text-red-700'">
              <p>{{ eligibilityResult.message }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bouton vérifier éligibilité -->
      <div class="flex justify-center">
        <button
          type="button"
          @click="checkEligibility"
          :disabled="!canCheckEligibility || isCheckingEligibility"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isCheckingEligibility" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isCheckingEligibility ? 'Vérification...' : 'Vérifier l\'éligibilité' }}
        </button>
      </div>
    </form>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from 'zod'

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
  typeContrat: '',
  zone: '',
  dateDebut: '',
  adresse: {
    rue: '',
    codePostal: '',
    ville: '',
    pays: 'France'
  }
})

const eligibilityResult = ref<any>(null)
const isCheckingEligibility = ref(false)
const isLoading = ref(false)
const errors = ref<Record<string, any>>({})

// Validation schema
const EligibilitySchema = z.object({
  typeContrat: z.enum(['I', 'P', 'C', 'A']),
  zone: z.enum(['TLS', 'PAR', 'MAR', 'LYO', 'NAN', 'BOR', 'MON', 'NIC', 'STR', 'LIL']),
  dateDebut: z.string().min(1, 'Date de début requise'),
  adresse: z.object({
    rue: z.string().min(5, 'Rue doit contenir au moins 5 caractères'),
    codePostal: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    ville: z.string().min(2, 'Ville doit contenir au moins 2 caractères'),
    pays: z.string().default('France')
  })
})

// Computed
const isValid = computed(() => {
  try {
    EligibilitySchema.parse(form.value)
    return true
  } catch {
    return false
  }
})

const canCheckEligibility = computed(() => {
  return form.value.zone && form.value.adresse.rue && form.value.adresse.codePostal
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const twoYears = new Date()
  twoYears.setFullYear(twoYears.getFullYear() + 2)
  return twoYears.toISOString().split('T')[0]
})

// Methods
const handleTypeChange = () => {
  // Logique spécifique au type de contrat
  console.log('Type de contrat changé:', form.value.typeContrat)
}

const checkEligibility = async () => {
  if (!canCheckEligibility.value) return
  
  isCheckingEligibility.value = true
  try {
    // Simulation appel API éligibilité
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    eligibilityResult.value = {
      isEligible: Math.random() > 0.3, // 70% de chance d'être éligible
      message: Math.random() > 0.3 
        ? 'Adresse éligible au service. Installation possible.'
        : 'Adresse non éligible. Veuillez contacter le service client.'
    }
  } catch (error) {
    console.error('Erreur vérification éligibilité:', error)
  } finally {
    isCheckingEligibility.value = false
  }
}

const validateForm = () => {
  try {
    EligibilitySchema.parse(form.value)
    errors.value = {}
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = {}
      error.errors.forEach(err => {
        if (err.path[0]) {
          const path = err.path.join('.')
          errors.value[path] = err.message
        }
      })
    }
    return false
  }
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  try {
    emit('update:formData', { eligibility: form.value })
    emit('next')
  } catch (error) {
    console.error('Erreur soumission:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for form data changes
watch(() => props.formData?.eligibility, (newData) => {
  if (newData) {
    form.value = { ...form.value, ...newData }
  }
}, { immediate: true })
</script> 