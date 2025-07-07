<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Modifier le profil
        </h2>
      </div>
      <Card class="p-8">
        <form @submit.prevent="handleUpdateProfile" class="space-y-6">
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
          <div>
            <label for="telephone" class="block text-sm font-medium text-gray-700">
              Téléphone
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
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email (non modifiable)
            </label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              disabled
              class="mt-1 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div v-if="authStore.error" class="text-red-600 text-sm text-center">
            {{ authStore.error }}
          </div>
          <Button type="submit" :disabled="authStore.isLoading" class="w-full">
            <span v-if="authStore.isLoading">Mise à jour...</span>
            <span v-else>Mettre à jour</span>
          </Button>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  prenom: '',
  nom: '',
  telephone: '',
  email: ''
})

onMounted(() => {
  if (authStore.user) {
    form.value.prenom = authStore.user.prenom
    form.value.nom = authStore.user.nom
    form.value.telephone = authStore.user.telephone || ''
    form.value.email = authStore.user.email
  }
})

const handleUpdateProfile = async () => {
  try {
    await authStore.updateProfile({
      prenom: form.value.prenom,
      nom: form.value.nom,
      telephone: form.value.telephone
    })
    router.push('/dashboard')
  } catch (err) {
    // L'erreur est déjà gérée dans le store
    console.error('Erreur de mise à jour du profil:', err)
  }
}
</script> 