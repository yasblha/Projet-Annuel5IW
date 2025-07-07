<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Confirmation d'invitation
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Choisissez un mot de passe pour activer votre compte.
        </p>
      </div>
      <Card class="p-8">
        <form @submit.prevent="handleConfirm" class="space-y-6">
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
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <Input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirmez le mot de passe"
              required
              class="mt-1"
            />
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

const handleConfirm = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    authStore.error = 'Les mots de passe ne correspondent pas'
    return
  }
  if (form.value.password.length < 12) {
    authStore.error = 'Le mot de passe doit contenir au moins 12 caractères'
    return
  }
  try {
    await authStore.confirmInvitation({
      token: route.params.token as string,
      password: form.value.password
    })
    router.push('/login')
  } catch (err) {
    // L'erreur est déjà gérée dans le store
    console.error('Erreur de confirmation:', err)
  }
}
</script> 