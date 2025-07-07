<template>
  <div class="user-summary p-6 rounded-lg border bg-white shadow-sm">
    <div class="flex items-center space-x-4 mb-6">
      <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow">
        <span class="text-white text-2xl font-bold select-none">
          {{ initials }}
        </span>
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-900">{{ fullName }}</h3>
        <p class="text-sm text-gray-500">{{ role }}</p>
        <span v-if="statut" :class="statusClass" class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1">
          {{ statut }}
        </span>
      </div>
    </div>
    <div class="space-y-3">
      <div class="flex justify-between">
        <span class="text-sm text-gray-600">Email:</span>
        <span class="text-sm font-medium">{{ email }}</span>
      </div>
      <div v-if="telephone" class="flex justify-between">
        <span class="text-sm text-gray-600">Téléphone:</span>
        <span class="text-sm font-medium">{{ telephone }}</span>
      </div>
    </div>
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Actions rapides</h4>
      <div class="space-y-2">
        <slot name="actions" />
        <button v-if="onProfile" @click="onProfile()" class="w-full mt-2 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
          Voir mon profil
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  fullName: string
  initials: string
  role: string
  email: string
  telephone?: string
  statut?: string
  onProfile?: () => void
}

const props = defineProps<Props>()

const statusClass = computed(() => {
  switch ((props.statut || '').toUpperCase()) {
    case 'ACTIF': return 'bg-green-100 text-green-700';
    case 'INACTIF': return 'bg-gray-100 text-gray-700';
    case 'SUSPENDU': return 'bg-red-100 text-red-700';
    case 'EN_ATTENTE_VALIDATION': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
})
</script>

<style scoped>
.user-summary {
  /* Styles déjà appliqués via Tailwind */
}
</style> 