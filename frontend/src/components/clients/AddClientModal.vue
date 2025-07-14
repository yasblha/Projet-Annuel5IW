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
          <!-- Champ rôle caché, hors de la grille pour éviter tout doublon -->
          <input type="hidden" v-model="form.role" />
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
            <i class="fas fa-chart-line text-purple-600"></i> Statuts métier
          </h3>
          <div class="flex flex-col md:grid md:grid-cols-2 gap-4">
            <div>
              <label class="block font-medium mb-1">Statut contractuel</label>
              <select v-model="form.statutContractuel" class="form-select">
                <option value="SANS_CONTRAT">Sans contrat</option>
                <option value="EN_NEGOCIATION">En négociation</option>
                <option value="CONTRAT_ACTIF">Contrat actif</option>
                <option value="CONTRAT_EXPIRE">Contrat expiré</option>
                <option value="CONTRAT_RESILIE">Contrat résilié</option>
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Statut de paiement</label>
              <select v-model="form.statutPaiement" class="form-select">
                <option value="A_JOUR">À jour</option>
                <option value="EN_RETARD">En retard</option>
                <option value="IMPAYE">Impayé</option>
                <option value="EN_PROCEDURE">En procédure</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Statut technique</label>
              <select v-model="form.statutTechnique" class="form-select">
                <option value="ACTIF">Actif</option>
                <option value="EN_PANNE">En panne</option>
                <option value="MAINTENANCE">En maintenance</option>
                <option value="COUPURE">Coupure</option>
                <option value="INACTIF">Inactif</option>
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Statut d'abonnement</label>
              <select v-model="form.statutAbonnement" class="form-select">
                <option value="SANS_ABONNEMENT">Sans abonnement</option>
                <option value="DEMANDE_EN_COURS">Demande en cours</option>
                <option value="ABONNE_ACTIF">Abonné actif</option>
                <option value="ABONNEMENT_SUSPENDU">Abonnement suspendu</option>
                <option value="ABONNEMENT_RESILIE">Abonnement résilié</option>
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Statut de facturation</label>
              <select v-model="form.statutFacturation" class="form-select">
                <option value="NORMAL">Normal</option>
                <option value="ESTIMEE">Estimée</option>
                <option value="EN_RETARD">En retard</option>
                <option value="SUSPENDUE">Suspendue</option>
                <option value="ANOMALIE">Anomalie</option>
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
            <div>
              <label class="block font-medium mb-1">Pays</label>
              <input v-model="form.adresse.pays" type="text" class="form-input" />
            </div>
            <div>
              <label class="block font-medium mb-1">Type d'adresse <span class="text-red-500">*</span></label>
              <select v-model="form.adresse.type" class="form-select" required>
                <option value="PRINCIPALE">Principale</option>
                <option value="FACTURATION">Facturation</option>
                <option value="LIVRAISON">Livraison</option>
              </select>
            </div>
          </div>
        </div>
        <div v-if="type === 'ENTREPRISE'" class="mb-4">
          <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <i class="fas fa-building text-yellow-600"></i> Entreprise
          </h3>
          <div class="flex flex-col md:grid md:grid-cols-2 gap-4">
            <div>
              <label class="block font-medium mb-1">Nom de l'entreprise <span class="text-red-500">*</span></label>
              <input v-model="form.entreprise.nom" type="text" class="form-input" required />
            </div>
            <div>
              <label class="block font-medium mb-1">SIRET</label>
              <input v-model="form.entreprise.siret" type="text" class="form-input" />
            </div>
            <div>
              <label class="block font-medium mb-1">Email entreprise</label>
              <input v-model="form.entreprise.contactEmail" type="email" class="form-input" />
            </div>
            <div>
              <label class="block font-medium mb-1">Téléphone entreprise</label>
              <input v-model="form.entreprise.contactTelephone" type="text" class="form-input" />
            </div>
            <div>
              <label class="block font-medium mb-1">Adresse entreprise</label>
              <input v-model="form.entreprise.adresse.ligne1" type="text" class="form-input" />
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
  role: 'CLIENT',
  statut: 'ACTIF',
  statutContractuel: 'SANS_CONTRAT',
  statutPaiement: 'A_JOUR',
  statutTechnique: 'ACTIF',
  statutAbonnement: 'SANS_ABONNEMENT',
  statutFacturation: 'NORMAL',
  adresse: {
    type: 'PRINCIPALE',
    ligne1: '',
    ligne2: '',
    codePostal: '',
    ville: '',
    pays: 'FR'
  },
  entreprise: {
    nom: '',
    siret: '',
    contactEmail: '',
    contactTelephone: '',
    adresse: {
      ligne1: '',
      codePostal: '',
      ville: '',
      pays: 'FR'
    }
  }
})

watch(type, (val) => {
  if (val === 'PARTICULIER') {
    form.value.entreprise = {
      nom: '', siret: '', contactEmail: '', contactTelephone: '', adresse: { ligne1: '', codePostal: '', ville: '', pays: 'FR' }
    }
  }
})

const clientStore = useClientStore()

async function onSubmit() {
  // Validation simple côté client
  if (!form.value.nom || !form.value.prenom || !form.value.email || !form.value.adresse.ligne1 || !form.value.adresse.codePostal || !form.value.adresse.ville) {
    alert('Veuillez remplir tous les champs obligatoires.')
    return
  }
  // Construction du payload sans propriété entreprise si particulier
  let payload: any = { ...form.value, type: type.value }
  if (type.value === 'PARTICULIER') {
    // On retire la propriété entreprise du payload sans utiliser delete
    const { entreprise, ...rest } = payload
    payload = rest
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