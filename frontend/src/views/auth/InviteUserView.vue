<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Inviter un utilisateur
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Saisissez les informations de l'utilisateur à inviter.
        </p>
      </div>
      <Card class="p-8">
        <form @submit.prevent="handleInvite" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Email de l'utilisateur"
              required
              class="mt-1"
            />
          </div>
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <Input
              id="firstName"
              v-model="form.firstName"
              type="text"
              placeholder="Prénom de l'utilisateur"
              required
              class="mt-1"
            />
          </div>
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <Input
              id="lastName"
              v-model="form.lastName"
              type="text"
              placeholder="Nom de l'utilisateur"
              required
              class="mt-1"
            />
          </div>
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">
              Rôle
            </label>
            <select
              id="role"
              v-model="form.role"
              required
              class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="CLIENT">Client</option>
              <option value="ADMIN">Administrateur</option>
              <option value="TECHNICIEN">Technicien</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="SUPPORT">Support</option>
              <option value="COMPTABLE">Comptable</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <div v-if="authStore.error" class="text-red-600 text-sm text-center">
            {{ authStore.error }}
          </div>
          <Button type="submit" :disabled="authStore.isLoading" class="w-full">
            <span v-if="authStore.isLoading">Invitation...</span>
            <span v-else>Inviter</span>
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
  email: '',
  firstName: '',
  lastName: '',
  role: 'CLIENT'
})

const handleInvite = async () => {
  try {
    await authStore.inviteUser(form.value)
    router.push('/dashboard')
  } catch (err) {
    // L'erreur est déjà gérée dans le store
    console.error('Erreur d'invitation:', err)
  }
}
</script> 