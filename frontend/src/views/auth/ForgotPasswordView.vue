<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Mot de passe oublié
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Saisissez votre adresse email pour recevoir un lien de réinitialisation.
        </p>
      </div>
      <Card class="p-8">
        <form @submit.prevent="handleForgot" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="votre@email.com"
              required
              class="mt-1"
            />
          </div>
          <div v-if="successMessage" class="text-green-600 text-sm text-center">
            {{ successMessage }}
          </div>
          <div v-if="authStore.error" class="text-red-600 text-sm text-center">
            {{ authStore.error }}
          </div>
          <Button type="submit" :disabled="authStore.isLoading" class="w-full">
            <span v-if="authStore.isLoading">Envoi en cours...</span>
            <span v-else>Envoyer le lien</span>
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
import { useAuthStore } from '@/stores/auth.store'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'

const authStore = useAuthStore()
const email = ref('')
const successMessage = ref('')

const handleForgot = async () => {
  successMessage.value = ''
  try {
    await authStore.forgotPassword(email.value)
    successMessage.value = 'Si cette adresse existe, un email de réinitialisation a été envoyé.'
    email.value = ''
  } catch (err) {
    return err;
  }
}
</script>