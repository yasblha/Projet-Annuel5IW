<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-screen p-4 md:p-8 relative animate-fade-in overflow-y-auto">
      <button class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition" @click="$emit('close')">
        <i class="fas fa-times fa-lg"></i>
      </button>
      <h2 class="text-3xl font-extrabold mb-6 text-blue-700 flex items-center gap-2">
        <i class="fas fa-user-plus"></i> Ajouter un client
      </h2>
      <form @submit.prevent="onSubmit" class="space-y-6">
        <div class="flex flex-col md:flex-row gap-4 items-center mb-2">
          <label class="font-semibold text-gray-700">Type de client</label>
          <select v-model="type" class="form-select rounded border-blue-300 focus:ring-2 focus:ring-blue-400 px-3 py-2">
            <option value="PARTICULIER">Particulier</option>
            <option value="ENTREPRISE">Entreprise</option>
          </select>
        </div>
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <i class="fas fa-user text-blue-600"></i> Informations utilisateur
          </h3>
          <div class="flex flex-col md:grid md:grid-cols-2 gap-4">
            <div>
              <label class="block font-medium mb-1">Nom <span class="text-red-500">*</span></label>
              <input v-model="form.nom" type="text" class="form-input" required />
            </div>
            <div>
              <label class="block font-medium mb-1">Prénom <span class="text-red-500">*</span></label>
              <input v-model="form.prenom" type="text" class="form-input" required />
            </div>
            <div>
              <label class="block font-medium mb-1">Email <span class="text-red-500">*</span></label>
              <input v-model="form.email" type="email" class="form-input" required />
            </div>
            <div>
              <label class="block font-medium mb-1">Téléphone</label>
              <input v-model="form.telephone" type="text" class="form-input" />
            </div>
            <div>
              <label class="block font-medium mb-1">Statut</label>
              <select v-model="form.statut" class="form-select">
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
            </div>
          </div>
        </div>
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <i class="fas fa-map-marker-alt text-green-600"></i> Adresse principale
          </h3>
          <div class="flex flex-col md:grid md:grid-cols-2 gap-4">
            <div>
              <label class="block font-medium mb-1">Adresse (ligne 1) <span class="text-red-500">*</span></label>
              <input v-model="form.adresse.ligne1" type="text" class="form-input" required />
            </div>
            <div>
              <label class="block font-medium mb-1">Adresse (ligne 2)</label>
              <input v-model="form.adresse.ligne2" type="text" class="form-input" />
            </div>
            <div>
              <label class="block font-medium mb-1">Code postal <span class="text-red-500">*</span></label>
              <input v-model="form.adresse.codePostal" type="text" class="form-input" required />
            </div>
            <div>
              <label class="block font-medium mb-1">Ville <span class="text-red-500">*</span></label>
              <input v-model="form.adresse.ville" type="text" class="form-input" required />
            </div>
          </div>
        </div>
        <div class="flex justify-end mt-8 space-x-2 sticky bottom-0 bg-white pt-4 z-10">
          <button type="button" class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition" @click="$emit('close')">Annuler</button>
          <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Créer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useClientStore } from '@/stores/client.store'

const emit = defineEmits(['close', 'created'])
const type = ref<'PARTICULIER' | 'ENTREPRISE'>('PARTICULIER')
const form = ref({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  statut: 'ACTIF',
  adresse: {
    ligne1: '',
    ligne2: '',
    codePostal: '',
    ville: '',
    pays: 'FR'
  }
})

watch(type, () => {
  // Rien à faire ici, nous gérons le type séparément
})

const clientStore = useClientStore()

async function onSubmit() {
  // Validation simple côté client
  if (!form.value.nom || !form.value.prenom || !form.value.email) {
    alert('Veuillez remplir tous les champs obligatoires.')
    return
  }
  
  // Construction du payload simplifié pour correspondre au backend
  const payload = {
    nom: form.value.nom,
    prenom: form.value.prenom,
    email: form.value.email,
    telephone: form.value.telephone || '',
    type: type.value,
    statut: form.value.statut,
    // Conversion de l'adresse au format attendu par le backend
    adresseLigne1: form.value.adresse.ligne1,
    adresseLigne2: form.value.adresse.ligne2 || '',
    codePostal: form.value.adresse.codePostal,
    ville: form.value.adresse.ville
  }
  
  try {
    const newClient = await clientStore.createClient(payload)
    emit('created', newClient)
    emit('close')
  } catch (e: any) {
    console.error('Erreur création client', e?.response?.data || e)
    alert('Erreur lors de la création du client : ' + (e?.response?.data?.message || e.message))
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