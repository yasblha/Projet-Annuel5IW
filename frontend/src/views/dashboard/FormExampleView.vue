<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Exemples de formulaires dynamiques</h1>
      <p class="text-gray-600">Démonstration du système de formulaires réutilisables</p>
    </div>

    <!-- Sélecteur de formulaire -->
    <div class="mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Choisissez un type de formulaire</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            v-for="(config, key) in availableForms" 
            :key="key"
            @click="selectForm(key)"
            :class="[
              'p-4 rounded-lg border-2 transition-all duration-200',
              selectedForm === key 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            ]"
          >
            <div class="text-center">
              <i :class="config.icon" class="text-2xl mb-2"></i>
              <div class="font-medium">{{ config.title }}</div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Formulaire sélectionné -->
    <div v-if="selectedForm" class="bg-white rounded-lg shadow">
      <DynamicForm 
        :config="currentFormConfig"
        :initial-data="initialData"
        @submit="handleFormSubmit"
        @reset="handleFormReset"
      />
    </div>

    <!-- Résultats -->
    <div v-if="formResults.length > 0" class="mt-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Résultats des soumissions</h2>
        <div class="space-y-4">
          <div 
            v-for="(result, index) in formResults" 
            :key="index"
            class="p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">{{ result.formType }}</span>
              <span class="text-sm text-gray-500">{{ result.timestamp }}</span>
            </div>
            <pre class="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">{{ JSON.stringify(result.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DynamicForm from '@/components/ui/DynamicForm.vue'
import { formConfigs } from '@/config/formConfigs'

interface FormResult {
  formType: string
  data: Record<string, any>
  timestamp: string
}

// Formulaires disponibles
const availableForms = {
  createUser: {
    title: 'Créer utilisateur',
    icon: 'fas fa-user-plus'
  },
  editUser: {
    title: 'Modifier utilisateur',
    icon: 'fas fa-user-edit'
  },
  createContract: {
    title: 'Nouveau contrat',
    icon: 'fas fa-file-contract'
  },
  createCompteur: {
    title: 'Nouveau compteur',
    icon: 'fas fa-tachometer-alt'
  },
  createAbonnement: {
    title: 'Nouvel abonnement',
    icon: 'fas fa-calendar-plus'
  },
  createIntervention: {
    title: 'Nouvelle intervention',
    icon: 'fas fa-tools'
  },
  createFacture: {
    title: 'Nouvelle facture',
    icon: 'fas fa-receipt'
  },
  profile: {
    title: 'Profil utilisateur',
    icon: 'fas fa-user-cog'
  },
  changePassword: {
    title: 'Changer mot de passe',
    icon: 'fas fa-lock'
  },
  contact: {
    title: 'Contact',
    icon: 'fas fa-envelope'
  }
}

const selectedForm = ref<string>('')
const formResults = ref<FormResult[]>([])
const initialData = ref<Record<string, any>>({})

// Configuration du formulaire actuel
const currentFormConfig = computed(() => {
  if (!selectedForm.value) return null
  return formConfigs[selectedForm.value as keyof typeof formConfigs]
})

// Sélectionner un formulaire
function selectForm(formKey: string) {
  selectedForm.value = formKey
  
  // Données initiales selon le type de formulaire
  switch (formKey) {
    case 'editUser':
      initialData.value = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@email.com',
        telephone: '01 23 45 67 89',
        role: 'CLIENT',
        statut: 'ACTIF'
      }
      break
    case 'profile':
      initialData.value = {
        nom: 'Utilisateur',
        prenom: 'Actuel',
        email: 'utilisateur@email.com',
        telephone: '01 98 76 54 32'
      }
      break
    default:
      initialData.value = {}
  }
}

// Gestion de la soumission
function handleFormSubmit(data: Record<string, any>) {
  const result: FormResult = {
    formType: availableForms[selectedForm.value as keyof typeof availableForms].title,
    data,
    timestamp: new Date().toLocaleString('fr-FR')
  }
  
  formResults.value.unshift(result)
  
  // Simulation d'un appel API
  console.log(`Soumission du formulaire ${selectedForm.value}:`, data)
  
  // Afficher une notification de succès
  alert(`Formulaire ${availableForms[selectedForm.value as keyof typeof availableForms].title} soumis avec succès !`)
}

// Gestion de la réinitialisation
function handleFormReset() {
  console.log('Formulaire réinitialisé')
}
</script> 