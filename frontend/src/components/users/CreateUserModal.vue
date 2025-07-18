<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md bg-white rounded-lg shadow-xl">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Créer un nouvel utilisateur
          </h3>
          <button 
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Nom -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.lastName }"
              placeholder="Nom de famille"
            />
            <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
          </div>

          <!-- Prénom -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.firstName }"
              placeholder="Prénom"
            />
            <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.email }"
              placeholder="email@exemple.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Téléphone -->
          <div>
            <label for="telephone" class="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              id="telephone"
              v-model="form.telephone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <!-- Rôle -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
              Rôle *
            </label>
            <select
              id="role"
              v-model="form.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un rôle</option>
              <option value="ADMIN">Administrateur</option>
              <option value="CLIENT">Client</option>
              <option value="TECHNICIEN">Technicien</option>
            </select>
          </div>

          <!-- Message d'information -->
          <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div class="flex">
              <span class="text-blue-600 mt-0.5 mr-2">ℹ️</span>
              <div class="text-sm text-blue-800">
                <p class="font-medium">Invitation automatique</p>
                <p>Un email d'invitation sera automatiquement envoyé à l'utilisateur pour qu'il puisse définir son mot de passe.</p>
              </div>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
            <div class="flex">
              <i class="fas fa-exclamation-circle text-red-600 mt-0.5 mr-2"></i>
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-user-plus mr-2"></i>
              {{ loading ? 'Création...' : 'Créer l\'utilisateur' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useUserStore } from '@/stores/user.store'
import type { CreateUserRequest, UserRole } from '@/types/user.types'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'user-created', user: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()

// Form data
const form = reactive<CreateUserRequest>({
  lastName: '',
  firstName: '',
  email: '',
  telephone: '',
  role: '' as UserRole
})

// Form validation
const errors = reactive({
  lastName: '',
  firstName: '',
  email: ''
})

const loading = ref(false)
const error = ref('')

// Validation functions
const validateForm = () => {
  let isValid = true
  errors.lastName = ''
  errors.firstName = ''
  errors.email = ''

  if (!form.lastName.trim()) {
    errors.lastName = 'Le nom est requis'
    isValid = false
  }

  if (!form.firstName.trim()) {
    errors.firstName = 'Le prénom est requis'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = 'L\'email est requis'
    isValid = false
  } else if (!isValidEmail(form.email)) {
    errors.email = 'L\'email n\'est pas valide'
    isValid = false
  }

  return isValid
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Submit handler
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    error.value = ''

    const response = await userStore.createUser({
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      email: form.email.trim().toLowerCase(),
      telephone: form.telephone?.trim() || undefined,
      role: form.role
    })

    // Considérer comme un succès si nous avons une réponse (avec ou sans propriété success)
    emit('user-created', response.user)
    closeModal()
    resetForm()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur'
  } finally {
    loading.value = false
  }
}

// Close modal
const closeModal = () => {
  emit('close')
}

// Reset form
const resetForm = () => {
  form.lastName = ''
  form.firstName = ''
  form.email = ''
  form.telephone = ''
  form.role = '' as UserRole
  error.value = ''
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})
</script> 