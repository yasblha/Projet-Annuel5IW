<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Confirmation d'invitation
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Saisissez le token reçu par email et choisissez un mot de passe.
        </p>
      </div>
      <Card class="p-8">
        <form @submit.prevent="handleConfirm" class="space-y-6">
          <div>
            <label for="token" class="block text-sm font-medium text-gray-700">
              Token d'invitation
            </label>
            <Input
              id="token"
              v-model="form.token"
              type="text"
              placeholder="Token reçu par email"
              required
              class="mt-1"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Nouveau mot de passe"
              required
              class="mt-1"
            />
            <p class="mt-1 text-xs text-gray-500">
              Minimum 12 caractères avec majuscule, minuscule, chiffre et symbole
            </p>
          </div>
          <div v-if="authStore.error" class="text-red-600 text-sm text-center">
            {{ authStore.error }}
          </div>
          <Button type="submit" :disabled="authStore.isLoading" class="w-full">
            <span v-if="authStore.isLoading">Confirmation...</span>
            <span v-else>Confirmer</span>
          </Button>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  token: '',
  password: ''
})

const handleConfirm = async () => {
  try {
    await authStore.confirmInvitation(form.value)
    router.push('/login')
  } catch (err) {
    // L'erreur est déjà gérée dans le store
    console.error('Erreur de confirmation:', err)
  }
}
</script> 