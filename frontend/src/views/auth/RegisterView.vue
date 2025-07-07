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
              <label for="prenom" class="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <Input
                id="prenom"
                v-model="form.prenom"
                type="text"
                placeholder="Votre prénom"
                required
                class="mt-1"
              />
            </div>
            <div>
              <label for="nom" class="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <Input
                id="nom"
                v-model="form.nom"
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
            <label for="motDePasse" class="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <Input
              id="motDePasse"
              v-model="form.motDePasse"
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

const router = useRouter()
const authStore = useAuthStore()

const form = ref<RegisterRequest>({
  nom: '',
  prenom: '',
  email: '',
  motDePasse: '',
  telephone: '',
  role: 'CLIENT'
})

const handleRegister = async () => {
  try {
    await authStore.register(form.value)
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