<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Réinitialisation du mot de passe
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Saisissez le token reçu par email et choisissez un nouveau mot de passe.
        </p>
      </div>
      <Card class="p-8">
        <form @submit.prevent="handleReset" class="space-y-6">
          <div>
            <label for="token" class="block text-sm font-medium text-gray-700">
              Token de réinitialisation
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
            <label for="newPassword" class="block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <Input
              id="newPassword"
              v-model="form.newPassword"
              type="password"
              placeholder="Nouveau mot de passe"
              required
              class="mt-1"
            />
            <p class="mt-1 text-xs text-gray-500">
              Minimum 12 caractères avec majuscule, minuscule, chiffre et symbole
            </p>
          </div>
          <div v-if="successMessage" class="text-green-600 text-sm text-center">
            {{ successMessage }}
          </div>
          <div v-if="authStore.error" class="text-red-600 text-sm text-center">
            {{ authStore.error }}
          </div>
          <Button type="submit" :disabled="authStore.isLoading" class="w-full">
            <span v-if="authStore.isLoading">Réinitialisation...</span>
            <span v-else>Réinitialiser le mot de passe</span>
          </Button>
        </form>
      </Card>
      <div class="text-center mt-4">
        <router-link to="/login" class="text-blue-600 hover:underline">
          Retour à la connexion
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'

const authStore = useAuthStore()
const router = useRouter()
const form = ref({
  token: '',
  newPassword: ''
})
const successMessage = ref('')

const handleReset = async () => {
  successMessage.value = ''
  try {
    await authStore.resetPassword(form.value)
    successMessage.value = 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
    form.value.token = ''
    form.value.newPassword = ''
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
return err;  }
}
</script>