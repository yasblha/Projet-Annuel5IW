<template>
  <div class="fixed inset-0 z-50 flex">
    <div class="flex-1 bg-black bg-opacity-30" @click="$emit('close')"></div>
    <div class="w-full max-w-lg bg-white h-full shadow-2xl p-8 overflow-y-auto animate-slide-in-right relative">
      <button class="absolute top-4 right-4 text-gray-400 hover:text-red-500" @click="$emit('close')">
        <i class="fas fa-times fa-lg"></i>
      </button>
      <h2 class="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        <i class="fas fa-user"></i> Fiche client
      </h2>
      <form class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block font-medium mb-1">Nom</label>
            <input class="form-input" :value="client.nom" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Prénom</label>
            <input class="form-input" :value="client.prenom" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Email</label>
            <input class="form-input" :value="client.email" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Téléphone</label>
            <input class="form-input" :value="client.telephone" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Type</label>
            <input class="form-input" :value="client.type === 'PARTICULIER' ? 'Particulier' : 'Entreprise'" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Statut</label>
            <input class="form-input" :value="client.statut" readonly />
          </div>
        </div>
        <hr />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block font-medium mb-1">Statut contractuel</label>
            <input class="form-input" :value="client.statutContractuel" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Statut paiement</label>
            <input class="form-input" :value="client.statutPaiement" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Statut technique</label>
            <input class="form-input" :value="client.statutTechnique" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Statut abonnement</label>
            <input class="form-input" :value="client.statutAbonnement" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Statut facturation</label>
            <input class="form-input" :value="client.statutFacturation" readonly />
          </div>
        </div>
        <hr />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block font-medium mb-1">Montant impayé</label>
            <input class="form-input" :value="client.montantImpaye + ' €'" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Factures impayées</label>
            <input class="form-input" :value="client.nombreFacturesImpayees" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Date dernier paiement</label>
            <input class="form-input" :value="formatDate(client.dateDernierPaiement)" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Date dernière facture</label>
            <input class="form-input" :value="formatDate(client.dateDerniereFacture)" readonly />
          </div>
        </div>
        <hr />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block font-medium mb-1">ID</label>
            <input class="form-input" :value="client.id" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Date création</label>
            <input class="form-input" :value="formatDate(client.dateCreation)" readonly />
          </div>
          <div>
            <label class="block font-medium mb-1">Date mise à jour</label>
            <input class="form-input" :value="formatDate(client.dateMaj)" readonly />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ client: any }>()
function formatDate(date: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR');
}
</script>

<style scoped>
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slide-in-right {
  animation: slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1);
}
.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-size: 1rem;
  background: #f9fafb;
}
.form-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px #2563eb33;
  background: #fff;
}
</style> 