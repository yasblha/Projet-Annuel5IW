<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Activation de votre compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Choisissez un mot de passe pour finaliser l'activation de votre compte.
        </p>
      </div>
      <Card class="p-8">
        <form @submit.prevent="handleActivate" class="space-y-6">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Votre mot de passe"
              required
              class="mt-1"
            />
            <p class="mt-1 text-xs text-gray-500">
              Minimum 12 caractères avec majuscule, minuscule, chiffre et symbole
            </p>
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <Input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirmez votre mot de passe"
              required
              class="mt-1"
            />
          </div>
          <div v-if="error" class="text-red-600 text-sm text-center">
            {{ error }}
          </div>
          <div v-if="successMessage" class="text-green-600 text-sm text-center">
            {{ successMessage }}
          </div>
          <Button type="submit" :disabled="isLoading" class="w-full">
            <span v-if="isLoading">Activation...</span>
            <span v-else>Activer mon compte</span>
          </Button>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  password: '',
  confirmPassword: ''
})

const error = ref('')
const successMessage = ref('')
const isLoading = ref(false)

onMounted(() => {
  // Vérifier que le token est présent dans l'URL
  if (!route.params.token) {
    error.value = 'Token d\'activation manquant'
  }
})

const handleActivate = async () => {
  error.value = ''
  successMessage.value = ''
  
  // Validation
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  
  if (form.value.password.length < 12) {
    error.value = 'Le mot de passe doit contenir au moins 12 caractères'
    return
  }
  
  isLoading.value = true
  
  try {
    await authStore.activateEmail(route.params.token as string, form.value.password)
    successMessage.value = 'Compte activé avec succès ! Redirection...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de l\'activation'
  } finally {
    isLoading.value = false
  }
}
</script> 