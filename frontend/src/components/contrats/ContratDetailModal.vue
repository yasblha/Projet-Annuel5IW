<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in">
      <button class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition" @click="$emit('close')">
        <i class="fas fa-times fa-lg"></i>
      </button>
      <h2 class="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        <i class="fas fa-file-contract"></i> Détail du contrat
      </h2>
      <div v-if="contrat" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span class="font-medium text-gray-600">Numéro :</span>
            <span class="ml-2">{{ contrat.numero }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Type propriétaire :</span>
            <span class="ml-2">{{ contrat.typeProprietaire }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Propriétaire :</span>
            <span class="ml-2">{{ contrat.proprietaireNom || contrat.proprietaireId }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Statut :</span>
            <span class="ml-2">{{ contrat.statut }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Date début :</span>
            <span class="ml-2">{{ formatDate(contrat.dateDebut) }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Date fin :</span>
            <span class="ml-2">{{ formatDate(contrat.dateFin) }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Date création :</span>
            <span class="ml-2">{{ formatDate(contrat.dateCreation) }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Date MAJ :</span>
            <span class="ml-2">{{ formatDate(contrat.dateMaj) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-400 text-center py-8">Aucune donnée à afficher.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ contrat: any }>()

function formatDate(date: string | Date | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease;
}
</style> 