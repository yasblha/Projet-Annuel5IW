<template>
  <div class="max-w-3xl mx-auto p-8">
    <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
      <i class="fas fa-user"></i> Détail du client
    </h1>
    <div v-if="loading" class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
      <p class="text-gray-500">Chargement...</p>
    </div>
    <div v-else-if="client" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 class="font-semibold text-blue-700 mb-2">Identité</h2>
          <p><b>Nom :</b> {{ client.nom }}</p>
          <p><b>Prénom :</b> {{ client.prenom }}</p>
          <p><b>Email :</b> {{ client.email }}</p>
          <p><b>Téléphone :</b> {{ client.telephone || '-' }}</p>
          <p><b>Type :</b> {{ client.type }}</p>
        </div>
        <div>
          <h2 class="font-semibold text-blue-700 mb-2">Statuts</h2>
          <p><b>Statut :</b> {{ client.statut }}</p>
          <p><b>Statut contractuel :</b> {{ client.statutContractuel }}</p>
          <p><b>Statut paiement :</b> {{ client.statutPaiement }}</p>
          <p><b>Statut technique :</b> {{ client.statutTechnique }}</p>
          <p><b>Statut abonnement :</b> {{ client.statutAbonnement }}</p>
          <p><b>Statut facturation :</b> {{ client.statutFacturation }}</p>
        </div>
        <div>
          <h2 class="font-semibold text-blue-700 mb-2">Facturation</h2>
          <p><b>Montant impayé :</b> {{ client.montantImpaye }} €</p>
          <p><b>Factures impayées :</b> {{ client.nombreFacturesImpayees }}</p>
          <p><b>Date dernier paiement :</b> {{ formatDate(client.dateDernierPaiement) }}</p>
          <p><b>Date dernière facture :</b> {{ formatDate(client.dateDerniereFacture) }}</p>
        </div>
        <div>
          <h2 class="font-semibold text-blue-700 mb-2">Infos système</h2>
          <p><b>ID :</b> {{ client.id }}</p>
          <p><b>Date création :</b> {{ formatDate(client.dateCreation) }}</p>
          <p><b>Date mise à jour :</b> {{ formatDate(client.dateMaj) }}</p>
        </div>
      </div>
      <div class="flex justify-end mt-8">
        <router-link :to="`/clients/${client.id}/edit`" class="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
          <i class="fas fa-edit"></i> Modifier
        </router-link>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 py-12">Client introuvable.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/services/api.service'

const route = useRoute()
const client = ref<any>(null)
const loading = ref(true)

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

onMounted(async () => {
  loading.value = true
  try {
    const { id } = route.params
    const res = await apiClient.get(`/clients/${id}`)
    client.value = res.data
  } catch (e) {
    client.value = null
  } finally {
    loading.value = false
  }
})
</script> 