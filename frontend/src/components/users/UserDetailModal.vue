<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md bg-white rounded-lg shadow-xl">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            <i class="fas fa-user mr-2 text-blue-600"></i>
            Détails de l'utilisateur
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-lg font-bold">
                {{ user.prenom?.charAt(0) }}{{ user.nom?.charAt(0) }}
              </span>
            </div>
            <div>
              <div class="text-lg font-semibold text-gray-900">{{ user.prenom }} {{ user.nom }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
              <div v-if="user.telephone" class="text-sm text-gray-400">
                <i class="fas fa-phone mr-1"></i>{{ user.telephone }}
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="font-medium">Rôle :</span> {{ user.role }}</div>
            <div><span class="font-medium">Statut :</span> {{ user.statut }}</div>
            <div><span class="font-medium">Créé le :</span> {{ formatDate(user.createdAt) }}</div>
            <div><span class="font-medium">Dernière connexion :</span> {{ user.dateDerniereConnexion ? formatDate(user.dateDerniereConnexion) : 'Jamais' }}</div>
          </div>
          <div v-if="showResendButton" class="pt-2">
            <button
              @click="handleResendInvitation"
              :disabled="loading"
              class="w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-envelope mr-2"></i>
              Renvoyer l'email d'activation
            </button>
            <div v-if="successMessage" class="mt-2 text-green-600 text-center text-sm">{{ successMessage }}</div>
            <div v-if="errorMessage" class="mt-2 text-red-600 text-center text-sm">{{ errorMessage }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user.store'
import type { User } from '@/types/user.types'

interface Props {
  isOpen: boolean
  user: User
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const userStore = useUserStore()

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const closeModal = () => {
  emit('close')
  successMessage.value = ''
  errorMessage.value = ''
}

const showResendButton = computed(() => {
  return ["EN_ATTENTE_VALIDATION", "INACTIF"].includes(props.user.statut as string)
})

const handleResendInvitation = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await userStore.resendInvitation(props.user.id)
    successMessage.value = "Email d'activation renvoyé avec succès."
  } catch (err: any) {
    errorMessage.value = err.message || "Erreur lors de l'envoi de l'email."
  } finally {
    loading.value = false
  }
}

function formatDate(date: string | Date | undefined) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script> 