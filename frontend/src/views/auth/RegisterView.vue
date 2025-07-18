<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un nouveau compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            connectez-vous à votre compte existant
          </router-link>
        </p>
      </div>
      
      <Card class="p-8">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <Input
                id="firstName"
                v-model="form.firstName"
                type="text"
                placeholder="Votre prénom"
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
                placeholder="Votre nom"
                required
                class="mt-1"
              />
            </div>
          </div>

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
              class="mt-1"
            />
          </div>

          <div>
            <label for="telephone" class="block text-sm font-medium text-gray-700">
              Téléphone (optionnel)
            </label>
            <Input
              id="telephone"
              v-model="form.telephone"
              type="tel"
              placeholder="Votre numéro de téléphone"
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
              class="mt-1"
            />
            <p class="mt-1 text-xs text-gray-500">
              Minimum 12 caractères avec majuscule, minuscule, chiffre et symbole
            </p>
          </div>

          <div>
            <label for="agencyName" class="block text-sm font-medium text-gray-700">
              Nom de votre entreprise
            </label>
            <Input
              id="agencyName"
              v-model="form.agencyName"
              type="text"
              placeholder="Nom de votre entreprise"
              required
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
            <span v-if="authStore.isLoading">Création en cours...</span>
            <span v-else>Créer le compte</span>
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
import type { RegisterRequest } from '@/types/auth.types'
import type { UserRole } from '@/types/user.types'

const router = useRouter()
const authStore = useAuthStore()

const form = ref<RegisterRequest>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  telephone: '',
  agencyName: ''
})

const handleRegister = async () => {
  try {
    // Ajouter automatiquement le rôle ADMIN au formulaire d'inscription
    const registerData = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      password: form.value.password, // <-- clé correcte attendue par le backend
      telephone: form.value.telephone,
      agencyName: form.value.agencyName,
      role: 'ADMIN' as UserRole  // Cast explicite pour satisfaire le type RegisterRequest
    }
    
    console.log('Données d\'inscription:', registerData)
    
    // Appel au store avec les données complètes
    await authStore.register(registerData)
    
    // Redirection vers la page de connexion après inscription réussie
    if (!authStore.error) {
      router.push('/login')
    }
  } catch (err) {
    // L'erreur est déjà gérée dans le store
    console.error('Erreur d\'inscription:', err)
  }
}
</script> 