<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestion des clients</h1>
      <p class="text-gray-600">Recherchez et gérez vos clients avec des critères avancés</p>
    </div>

    <!-- Composant de recherche avancée -->
    <ClientSearchCard @search="handleSearch" />

    <!-- Résultats de recherche -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-800">
          <i class="fas fa-users mr-2 text-blue-600"></i>
          Résultats de recherche
          <span v-if="clients.length > 0" class="text-sm font-normal text-gray-500 ml-2">
            ({{ clients.length }} client{{ clients.length > 1 ? 's' : '' }} trouvé{{ clients.length > 1 ? 's' : '' }})
          </span>
        </h2>
        <button 
          v-if="clients.length > 0"
          @click="exportResults" 
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <i class="fas fa-download mr-2"></i>
          Exporter
        </button>
      </div>

      <!-- Tableau des résultats -->
      <div v-if="clients.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrat
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compteur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="client in clients" :key="client.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-blue-800">
                          {{ getInitials(client.nom, client.prenom) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ client.prenom }} {{ client.nom }}
                      </div>
                      <div class="text-sm text-gray-500">
                        ID: {{ client.id }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ client.email }}</div>
                  <div class="text-sm text-gray-500">{{ client.telephone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ client.adresse?.ligne1 || 'Non renseignée' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ client.adresse?.codePostal }} {{ client.adresse?.ville }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ client.contrat?.numero || 'Aucun contrat' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(client.contrat?.dateDebut) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ client.compteur?.serial || 'Aucun compteur' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ client.compteur?.type || '' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(client.statut)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getStatusLabel(client.statut) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      @click="viewClient(client)" 
                      class="text-blue-600 hover:text-blue-900"
                      title="Voir les détails"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      @click="editClient(client)" 
                      class="text-green-600 hover:text-green-900"
                      title="Modifier"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="deleteClient(client)" 
                      class="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Message si aucun résultat -->
      <div v-else-if="hasSearched" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <i class="fas fa-search text-6xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
        <p class="text-gray-500">Essayez de modifier vos critères de recherche</p>
      </div>

      <!-- Message initial -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <i class="fas fa-users text-6xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Recherchez vos clients</h3>
        <p class="text-gray-500">Utilisez les critères de recherche ci-dessus pour trouver vos clients</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ClientSearchCard from '@/components/clients/ClientSearchCard.vue'

interface Client {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  statut: string
  adresse?: {
    ligne1: string
    codePostal: string
    ville: string
  }
  contrat?: {
    numero: string
    dateDebut: string
  }
  compteur?: {
    serial: string
    type: string
  }
}

const clients = ref<Client[]>([])
const hasSearched = ref(false)

function handleSearch(filters: any) {
  console.log('Recherche avec les filtres:', filters)
  hasSearched.value = true
  
  // TODO: Appel API réel
  // const results = await api.searchClients(filters)
  
  // Simulation de résultats pour la démo
  clients.value = [
    {
      id: '1',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      telephone: '01 23 45 67 89',
      statut: 'ACTIF',
      adresse: {
        ligne1: '123 Rue de la Paix',
        codePostal: '75001',
        ville: 'Paris'
      },
      contrat: {
        numero: 'CON-2024-001',
        dateDebut: '2024-01-15'
      },
      compteur: {
        serial: 'COMP-001',
        type: 'EAU_FROIDE'
      }
    },
    {
      id: '2',
      nom: 'Martin',
      prenom: 'Marie',
      email: 'marie.martin@email.com',
      telephone: '01 98 76 54 32',
      statut: 'EN_ATTENTE_VALIDATION',
      adresse: {
        ligne1: '456 Avenue des Champs',
        codePostal: '75008',
        ville: 'Paris'
      },
      contrat: {
        numero: 'CON-2024-002',
        dateDebut: '2024-02-01'
      },
      compteur: {
        serial: 'COMP-002',
        type: 'EAU_CHAUDE'
      }
    }
  ]
}

function getInitials(nom?: string, prenom?: string): string {
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase()
}

function getStatusClass(statut: string): string {
  switch (statut) {
    case 'ACTIF':
      return 'bg-green-100 text-green-800'
    case 'EN_ATTENTE_VALIDATION':
      return 'bg-yellow-100 text-yellow-800'
    case 'SUSPENDU':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(statut: string): string {
  switch (statut) {
    case 'ACTIF':
      return 'Actif'
    case 'EN_ATTENTE_VALIDATION':
      return 'En attente'
    case 'SUSPENDU':
      return 'Suspendu'
    default:
      return statut
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR')
}

function viewClient(client: Client) {
  console.log('Voir client:', client)
  // TODO: Navigation vers la page de détail
}

function editClient(client: Client) {
  console.log('Modifier client:', client)
  // TODO: Navigation vers la page d'édition
}

function deleteClient(client: Client) {
  console.log('Supprimer client:', client)
  // TODO: Confirmation et suppression
}

function exportResults() {
  console.log('Exporter les résultats')
  // TODO: Export CSV/Excel
}
</script> 