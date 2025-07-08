<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p class="mt-2 text-gray-600">Gérez vos informations personnelles et votre mot de passe</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Informations du profil -->
        <Card class="p-6">
          <CardHeader>
            <h2 class="text-xl font-semibold text-gray-900">
              <i class="fas fa-user mr-2"></i>
              Informations personnelles
            </h2>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="updateProfile" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Prénom</label>
                  <Input
                    v-model="profileForm.prenom"
                    type="text"
                    required
                    autocomplete="off"
                    class="mt-1"
                  />
                  <div v-if="profileValidationErrors.prenom" class="text-red-600 text-sm mt-1">
                    {{ profileValidationErrors.prenom }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nom</label>
                  <Input
                    v-model="profileForm.nom"
                    type="text"
                    required
                    autocomplete="off"
                    class="mt-1"
                  />
                  <div v-if="profileValidationErrors.nom" class="text-red-600 text-sm mt-1">
                    {{ profileValidationErrors.nom }}
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <Input
                  v-model="profileForm.email"
                  type="email"
                  required
                  autocomplete="off"
                  class="mt-1"
                />
                <div v-if="profileValidationErrors.email" class="text-red-600 text-sm mt-1">
                  {{ profileValidationErrors.email }}
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Téléphone</label>
                <Input
                  v-model="profileForm.telephone"
                  type="tel"
                  autocomplete="off"
                  class="mt-1"
                />
                <div v-if="profileValidationErrors.telephone" class="text-red-600 text-sm mt-1">
                  {{ profileValidationErrors.telephone }}
                </div>
              </div>

              <div v-if="profileError" class="text-red-600 text-sm">
                {{ profileError }}
              </div>
              <div v-if="profileSuccess" class="text-green-600 text-sm">
                {{ profileSuccess }}
              </div>

              <Button
                type="submit"
                :disabled="profileLoading"
                class="w-full"
              >
                <span v-if="profileLoading">Mise à jour...</span>
                <span v-else>Mettre à jour le profil</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        <!-- Changement de mot de passe -->
        <Card class="p-6">
          <CardHeader>
            <h2 class="text-xl font-semibold text-gray-900">
              <i class="fas fa-lock mr-2"></i>
              Sécurité
            </h2>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="changePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                <Input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  required
                  class="mt-1"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                <Input
                  v-model="passwordForm.newPassword"
                  type="password"
                  required
                  class="mt-1"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Minimum 12 caractères avec majuscule, minuscule, chiffre et symbole
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                <Input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  required
                  class="mt-1"
                />
              </div>

              <div v-if="passwordError" class="text-red-600 text-sm">
                {{ passwordError }}
              </div>
              <div v-if="passwordSuccess" class="text-green-600 text-sm">
                {{ passwordSuccess }}
              </div>

              <Button
                type="submit"
                :disabled="passwordLoading"
                class="w-full"
              >
                <span v-if="passwordLoading">Changement...</span>
                <span v-else>Changer le mot de passe</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <!-- Informations du compte -->
      <Card class="mt-8 p-6">
        <CardHeader>
          <h2 class="text-xl font-semibold text-gray-900">
            <i class="fas fa-info-circle mr-2"></i>
            Informations du compte
          </h2>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Rôle</label>
              <p class="mt-1 text-sm text-gray-900">{{ userStore.currentUser?.role }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Statut</label>
              <p class="mt-1 text-sm text-gray-900">{{ userStore.currentUser?.statut }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date de création</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(userStore.currentUser?.createdAt) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Dernière connexion</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(userStore.currentUser?.dateDerniereConnexion) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import { z } from 'zod'

const authStore = useAuthStore()
const userStore = useUserStore()

const profileForm = ref({
  prenom: '',
  nom: '',
  email: '',
  telephone: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileLoading = ref(false)
const passwordLoading = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const profileValidationErrors = ref<{ [key: string]: string }>({})

defineExpose({ profileValidationErrors })

// Schéma Zod pour la validation du profil
const profileSchema = z.object({
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional().or(z.literal('')),
})

onMounted(async () => {
  if (authStore.user) {
    await userStore.fetchUserById(Number(authStore.user.id))
    if (userStore.currentUser) {
      profileForm.value = {
        prenom: userStore.currentUser.prenom,
        nom: userStore.currentUser.nom,
        email: userStore.currentUser.email,
        telephone: userStore.currentUser.telephone || ''
      }
    }
  }
})

const updateProfile = async () => {
  if (!authStore.user) return
  profileLoading.value = true
  profileError.value = ''
  profileSuccess.value = ''
  profileValidationErrors.value = {}

  // Validation Zod
  const result = profileSchema.safeParse(profileForm.value)
  if (!result.success) {
    // Afficher les erreurs de validation
    for (const err of result.error.errors) {
      profileValidationErrors.value[err.path[0]] = err.message
    }
    profileLoading.value = false
    return
  }

  try {
    // PATCH /auth/profile
    await authStore.updateProfile({
      prenom: profileForm.value.prenom,
      nom: profileForm.value.nom,
      telephone: profileForm.value.telephone
    })
    // Mettre à jour le store d'authentification
    if (userStore.currentUser) {
      authStore.user = {
        id: userStore.currentUser.id.toString(),
        email: userStore.currentUser.email,
        nom: userStore.currentUser.nom,
        prenom: userStore.currentUser.prenom,
        role: userStore.currentUser.role,
        telephone: userStore.currentUser.telephone,
        statut: userStore.currentUser.statut,
        createdAt: userStore.currentUser.createdAt,
        updatedAt: userStore.currentUser.updatedAt
      }
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
    profileSuccess.value = 'Profil mis à jour avec succès'
  } catch (err: any) {
    profileError.value = err.message || 'Erreur lors de la mise à jour du profil'
  } finally {
    profileLoading.value = false
  }
}

const changePassword = async () => {
  if (!authStore.user) return
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Les mots de passe ne correspondent pas'
    return
  }
  if (passwordForm.value.newPassword.length < 12) {
    passwordError.value = 'Le mot de passe doit contenir au moins 12 caractères'
    return
  }
  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''
  try {
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    passwordSuccess.value = 'Mot de passe changé avec succès'
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (err: any) {
    passwordError.value = err.message || 'Erreur lors du changement de mot de passe'
  } finally {
    passwordLoading.value = false
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Non disponible'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script> 