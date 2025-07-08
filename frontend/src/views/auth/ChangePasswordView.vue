<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Changer le mot de passe
        </h2>
      </div>
      <Card class="p-8">
        <form @submit.prevent="handleChangePassword" class="space-y-6">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700">
              Ancien mot de passe
            </label>
            <Input
              id="currentPassword"
              v-model="form.currentPassword"
              type="password"
              placeholder="Ancien mot de passe"
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
          <div v-if="authStore.error" class="text-red-600 text-sm text-center">
            {{ authStore.error }}
          </div>
          <Button type="submit" :disabled="authStore.isLoading" class="w-full">
            <span v-if="authStore.isLoading">Changement...</span>
            <span v-else>Changer le mot de passe</span>
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
  currentPassword: '',
  newPassword: ''
})

const handleChangePassword = async () => {
  try {
    await authStore.changePassword(form.value)
    router.push('/dashboard')
  } catch (err) {
    // L'erreur est déjà gérée dans le store
    console.error('Erreur de changement de mot de passe:', err)
  }
}
</script> 