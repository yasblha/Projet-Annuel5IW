<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in">
      <button class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition" @click="$emit('close')">
        <i class="fas fa-times fa-lg"></i>
      </button>
      <h2 class="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        <i class="fas fa-file-contract"></i> Ajouter un contrat
      </h2>
      <form @submit.prevent="onSubmit" class="space-y-5">
        <div>
          <label class="block font-medium mb-1">Zone <span class="text-red-500">*</span></label>
          <input v-model="form.zone" type="text" class="form-input" required placeholder="Ex: TLS" />
        </div>
        <div>
          <label class="block font-medium mb-1">Type de propriétaire <span class="text-red-500">*</span></label>
          <select v-model="form.typeProprietaire" class="form-select" required>
            <option value="">--</option>
            <option value="UTILISATEUR">Utilisateur</option>
            <option value="ENTREPRISE">Entreprise</option>
          </select>
        </div>
        <div>
          <label class="block font-medium mb-1">ID propriétaire <span class="text-red-500">*</span></label>
          <input v-model="form.proprietaireId" type="text" class="form-input" required placeholder="UUID du propriétaire" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-medium mb-1">Date début <span class="text-red-500">*</span></label>
            <input v-model="form.dateDebut" type="date" class="form-input" required />
          </div>
          <div>
            <label class="block font-medium mb-1">Date fin</label>
            <input v-model="form.dateFin" type="date" class="form-input" />
          </div>
        </div>
        <div>
          <label class="block font-medium mb-1">Statut <span class="text-red-500">*</span></label>
          <select v-model="form.statut" class="form-select" required>
            <option value="EN_ATTENTE">En attente</option>
            <option value="ACTIF">Actif</option>
            <option value="SUSPENDU">Suspendu</option>
            <option value="RESILIE">Résilié</option>
          </select>
        </div>
        <div class="flex justify-end mt-8 space-x-2">
          <button type="button" class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition" @click="$emit('close')">Annuler</button>
          <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Créer</button>
        </div>
        <div v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import apiClient from '@/services/api.service'

const emit = defineEmits(['close', 'created'])
const form = ref({
  zone: '',
  typeProprietaire: '',
  proprietaireId: '',
  dateDebut: '',
  dateFin: '',
  statut: 'EN_ATTENTE'
})
const error = ref('')

async function onSubmit() {
  error.value = ''
  if (!form.value.zone || !form.value.typeProprietaire || !form.value.proprietaireId || !form.value.dateDebut || !form.value.statut) {
    error.value = 'Veuillez remplir tous les champs obligatoires.'
    return
  }
  try {
    await apiClient.post('/contracts', form.value)
    emit('created')
    emit('close')
    form.value.zone = ''
    form.value.typeProprietaire = ''
    form.value.proprietaireId = ''
    form.value.dateDebut = ''
    form.value.dateFin = ''
    form.value.statut = 'EN_ATTENTE'
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erreur lors de la création du contrat.'
  }
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
.form-input, .form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-size: 1rem;
  background: #f9fafb;
}
.form-input:focus, .form-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px #2563eb33;
  background: #fff;
}
</style> 