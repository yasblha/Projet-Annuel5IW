<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Cosignataires</h2>
      <p class="text-gray-600">Ajoutez les cosignataires et envoyez les invitations</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Formulaire ajout cosignataire -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Ajouter un cosignataire</h3>
          
          <form @submit.prevent="addCosigner" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  v-model="newCosigner.prenom"
                  type="text"
                  :class="[
                    'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    errors.prenom ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                />
                <p v-if="errors.prenom" class="mt-1 text-sm text-red-600">
                  {{ errors.prenom }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  v-model="newCosigner.nom"
                  type="text"
                  :class="[
                    'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    errors.nom ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                />
                <p v-if="errors.nom" class="mt-1 text-sm text-red-600">
                  {{ errors.nom }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                v-model="newCosigner.email"
                type="email"
                :class="[
                  'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.email ? 'border-red-500' : 'border-gray-300'
                ]"
                required
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">
                {{ errors.email }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  v-model="newCosigner.telephone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Part (%) *
                </label>
                <input
                  v-model="newCosigner.part"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  :class="[
                    'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    errors.part ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                />
                <p v-if="errors.part" class="mt-1 text-sm text-red-600">
                  {{ errors.part }}
                </p>
              </div>
            </div>

            <div class="flex justify-between">
              <button
                type="submit"
                :disabled="!canAddCosigner || isAddingCosigner"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isAddingCosigner" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isAddingCosigner ? 'Ajout...' : 'Ajouter' }}
              </button>

              <button
                type="button"
                @click="resetForm"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>

        <!-- Progression des parts -->
        <div class="bg-gray-50 p-4 rounded-md">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Répartition des parts</h4>
          <div class="flex items-center space-x-2">
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: totalParts + '%' }"
              ></div>
            </div>
            <span class="text-sm font-medium text-gray-700">{{ totalParts }}%</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ totalParts < 100 ? `${100 - totalParts}% restant` : 'Répartition complète' }}
          </p>
        </div>
      </div>

      <!-- Liste des cosignataires -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Cosignataires ({{ cosigners.length }})</h3>
          
          <div v-if="cosigners.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun cosignataire</h3>
            <p class="mt-1 text-sm text-gray-500">Commencez par ajouter un cosignataire.</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(cosigner, index) in cosigners"
              :key="index"
              class="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600">
                        {{ cosigner.prenom.charAt(0) }}{{ cosigner.nom.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ cosigner.prenom }} {{ cosigner.nom }}
                    </p>
                    <p class="text-sm text-gray-500">{{ cosigner.email }}</p>
                    <p v-if="cosigner.telephone" class="text-sm text-gray-500">{{ cosigner.telephone }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-gray-900">{{ cosigner.part }}%</span>
                  <button
                    type="button"
                    @click="removeCosigner(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions envoi invitations -->
        <div v-if="cosigners.length > 0" class="space-y-3">
          <button
            type="button"
            @click="sendInvitations"
            :disabled="isSendingInvitations"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isSendingInvitations" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            {{ isSendingInvitations ? 'Envoi...' : 'Envoyer les invitations' }}
          </button>
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
const cosigners = ref<any[]>([])
const newCosigner = ref({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  part: 0
})

const isAddingCosigner = ref(false)
const isSendingInvitations = ref(false)
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

// Validation schema
const CosignerSchema = z.object({
  prenom: z.string().min(2, 'Prénom doit contenir au moins 2 caractères'),
  nom: z.string().min(2, 'Nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  part: z.number().min(0.01, 'Part doit être supérieure à 0').max(100, 'Part ne peut pas dépasser 100%')
})

// Computed
const isValid = computed(() => {
  return cosigners.value.length > 0 && totalParts.value === 100
})

const canAddCosigner = computed(() => {
  try {
    CosignerSchema.parse(newCosigner.value)
    return totalParts.value + newCosigner.value.part <= 100
  } catch {
    return false
  }
})

const totalParts = computed(() => {
  return cosigners.value.reduce((sum, cosigner) => sum + cosigner.part, 0)
})

// Methods
const validateCosigner = () => {
  try {
    CosignerSchema.parse(newCosigner.value)
    errors.value = {}
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

const addCosigner = async () => {
  if (!validateCosigner()) {
    return
  }

  if (totalParts.value + newCosigner.value.part > 100) {
    errors.value.part = 'La somme des parts ne peut pas dépasser 100%'
    return
  }

  isAddingCosigner.value = true
  try {
    // Simuler appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    cosigners.value.push({ ...newCosigner.value })
    resetForm()
  } catch (error) {
    console.error('Erreur ajout cosignataire:', error)
  } finally {
    isAddingCosigner.value = false
  }
}

const removeCosigner = (index: number) => {
  cosigners.value.splice(index, 1)
}

const resetForm = () => {
  newCosigner.value = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    part: 0
  }
  errors.value = {}
}

const sendInvitations = async () => {
  isSendingInvitations.value = true
  try {
    // Simuler envoi invitations
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Invitations envoyées')
  } catch (error) {
    console.error('Erreur envoi invitations:', error)
  } finally {
    isSendingInvitations.value = false
  }
}

const handleSubmit = async () => {
  if (!isValid.value) {
    return
  }
  
  isLoading.value = true
  try {
    emit('update:formData', { cosigners: cosigners.value })
    emit('next')
  } catch (error) {
    console.error('Erreur soumission:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for form data changes
watch(() => props.formData?.cosigners, (newData) => {
  if (newData) {
    cosigners.value = [...newData]
  }
}, { immediate: true })
</script> 