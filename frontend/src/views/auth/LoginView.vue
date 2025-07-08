<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à votre compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            créez un nouveau compte
          </router-link>
        </p>
      </div>
      
      <Card class="p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="votre@email.com"
              required
              autocomplete="off"
              class="mt-1"
            />
          </div>

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
              autocomplete="off"
              class="mt-1"
            />
          </div>

          <div v-if="authStore.error" class="text-red-600 text-sm text-center">
            {{ authStore.error }}
          </div>

          <Button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full"
          >
            <span v-if="authStore.isLoading">Connexion en cours...</span>
            <span v-else>Se connecter</span>
          </Button>
          <p class="mt-2 text-center text-sm text-gray-600">
            <router-link to="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
              Mot de passe oublié ?
            </router-link>
          </p>
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
import type { LoginRequest } from '@/types/auth.types'

const router = useRouter()
const authStore = useAuthStore()

const form = ref<LoginRequest>({
  email: '',
  password: ''
})

const handleLogin = async () => {
  try {
    await authStore.login(form.value)
    router.push('/hub')
  } catch (err) {
    console.error('Erreur de connexion:', err);
    return err;
  }
}
</script> 