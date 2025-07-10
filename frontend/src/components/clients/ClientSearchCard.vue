<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">
        <i class="fas fa-search mr-2 text-blue-600"></i>
        Recherche avancée client
      </h2>
      <button 
        @click="toggleAdvanced" 
        class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
      >
        <i :class="isAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="mr-1"></i>
        {{ isAdvanced ? 'Recherche simple' : 'Recherche avancée' }}
      </button>
    </div>

    <form @submit.prevent="onSearch" class="space-y-6">
      <!-- Recherche simple -->
      <div v-if="!isAdvanced" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input 
            v-model="form.nom" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom du client"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input 
            v-model="form.telephone" 
            type="tel" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Téléphone"
          />
        </div>
      </div>

      <!-- Recherche avancée -->
      <div v-if="isAdvanced" class="space-y-6">
        <!-- Identité -->
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <i class="fas fa-user mr-2 text-blue-600"></i>
            Identité
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input 
                v-model="form.nom" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input 
                v-model="form.prenom" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                v-model="form.email" 
                type="email" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input 
                v-model="form.telephone" 
                type="tel" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Téléphone"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select 
                v-model="form.role" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les rôles</option>
                <option value="CLIENT">Client</option>
                <option value="ADMIN">Administrateur</option>
                <option value="TECHNICIEN">Technicien</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select 
                v-model="form.statut" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="PROSPECT">Prospect</option>
                <option value="ACTIF">Actif</option>
                <option value="SUSPENDU">Suspendu</option>
                <option value="INACTIF">Inactif</option>
                <option value="RESILIE">Résilié</option>
                <option value="ARCHIVE">Archivé</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut contractuel</label>
              <select 
                v-model="form.statutContractuel" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="SANS_CONTRAT">Sans contrat</option>
                <option value="EN_NEGOCIATION">En négociation</option>
                <option value="EN_ATTENTE_SIGNATURE">En attente signature</option>
                <option value="CONTRAT_ACTIF">Contrat actif</option>
                <option value="CONTRAT_SUSPENDU">Contrat suspendu</option>
                <option value="CONTRAT_RESILIE">Contrat résilié</option>
                <option value="CONTRAT_EXPIRE">Contrat expiré</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut de paiement</label>
              <select 
                v-model="form.statutPaiement" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="A_JOUR">À jour</option>
                <option value="RETARD_LEGER">Retard léger</option>
                <option value="RETARD_MODERE">Retard modéré</option>
                <option value="RETARD_IMPORTANT">Retard important</option>
                <option value="IMPAYE">Impayé</option>
                <option value="EN_PROCEDURE">En procédure</option>
                <option value="LITIGE">Litige</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Adresse -->
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <i class="fas fa-map-marker-alt mr-2 text-green-600"></i>
            Adresse
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Adresse (ligne 1)</label>
              <input 
                v-model="form.ligne1" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adresse"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Adresse (ligne 2)</label>
              <input 
                v-model="form.ligne2" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Complément d'adresse"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
              <input 
                v-model="form.codePostal" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Code postal"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input 
                v-model="form.ville" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ville"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <input 
                v-model="form.pays" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pays"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type d'adresse</label>
              <select 
                v-model="form.typeAdresse" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="FACTURATION">Facturation</option>
                <option value="LIVRAISON">Livraison</option>
                <option value="PRINCIPALE">Principale</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Compteur et Abonnement -->
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <i class="fas fa-tachometer-alt mr-2 text-purple-600"></i>
            Compteur & Abonnement
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">N° de série compteur</label>
              <input 
                v-model="form.numeroCompteur" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Numéro de série"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type de compteur</label>
              <select 
                v-model="form.typeCompteur" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="EAU_FROIDE">Eau froide</option>
                <option value="EAU_CHAUDE">Eau chaude</option>
                <option value="ELECTRIQUE">Électrique</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut compteur</label>
              <select 
                v-model="form.statutCompteur" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="MAINTENANCE">En maintenance</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Emplacement compteur</label>
              <input 
                v-model="form.emplacementCompteur" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Emplacement"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Début abonnement</label>
              <input 
                v-model="form.dateDebutAbonnement" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fin abonnement</label>
              <input 
                v-model="form.dateFinAbonnement" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fréquence abonnement</label>
              <select 
                v-model="form.frequenceAbonnement" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les fréquences</option>
                <option value="MENSUELLE">Mensuelle</option>
                <option value="TRIMESTRIELLE">Trimestrielle</option>
                <option value="SEMESTRIELLE">Semestrielle</option>
                <option value="ANNUELLE">Annuelle</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Contrat -->
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <i class="fas fa-file-contract mr-2 text-orange-600"></i>
            Contrat
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">N° de contrat</label>
              <input 
                v-model="form.numeroContrat" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Numéro de contrat"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut contrat</label>
              <select 
                v-model="form.statutContrat" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="ACTIF">Actif</option>
                <option value="SUSPENDU">Suspendu</option>
                <option value="TERMINE">Terminé</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type de propriétaire</label>
              <select 
                v-model="form.typeProprietaire" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="PARTICULIER">Particulier</option>
                <option value="ENTREPRISE">Entreprise</option>
                <option value="COPROPRIETE">Copropriété</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Début contrat</label>
              <input 
                v-model="form.dateDebutContrat" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fin contrat</label>
              <input 
                v-model="form.dateFinContrat" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Entreprise -->
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <i class="fas fa-building mr-2 text-indigo-600"></i>
            Entreprise
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom entreprise</label>
              <input 
                v-model="form.nomEntreprise" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
              <input 
                v-model="form.siret" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Numéro SIRET"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email contact</label>
              <input 
                v-model="form.contactEmail" 
                type="email" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email de contact"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone contact</label>
              <input 
                v-model="form.contactTelephone" 
                type="tel" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Téléphone de contact"
              />
            </div>
          </div>
        </div>

        <!-- Facturation -->
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <i class="fas fa-receipt mr-2 text-red-600"></i>
            Facturation
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">N° de facture</label>
              <input 
                v-model="form.numeroFacture" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Numéro de facture"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant HT (€)</label>
              <input 
                v-model="form.montantHT" 
                type="number" 
                step="0.01" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Montant HT"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date d'émission</label>
              <input 
                v-model="form.dateEmission" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
              <input 
                v-model="form.dateEcheance" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Interventions -->
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <i class="fas fa-tools mr-2 text-yellow-600"></i>
            Interventions
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type d'intervention</label>
              <select 
                v-model="form.typeIntervention" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="INSTALLATION">Installation</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="REPARATION">Réparation</option>
                <option value="RELEVE">Relevé</option>
                <option value="DEMENAGEMENT">Déménagement</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut intervention</label>
              <select 
                v-model="form.statutIntervention" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="PROGRAMMEE">Programmée</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINEE">Terminée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date planifiée</label>
              <input 
                v-model="form.datePlanifiee" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date réalisée</label>
              <input 
                v-model="form.dateRealisee" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="flex justify-end space-x-3 pt-4">
        <button 
          type="button" 
          @click="resetForm" 
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <i class="fas fa-undo mr-2"></i>
          Réinitialiser
        </button>
        <button 
          type="submit" 
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <i class="fas fa-search mr-2"></i>
          Rechercher
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface SearchForm {
  // Identité
  nom: string
  prenom: string
  email: string
  telephone: string
  role: string
  statut: string
  
  // Adresse
  ligne1: string
  ligne2: string
  codePostal: string
  ville: string
  pays: string
  typeAdresse: string
  
  // Compteur et Abonnement
  numeroCompteur: string
  typeCompteur: string
  statutCompteur: string
  emplacementCompteur: string
  dateDebutAbonnement: string
  dateFinAbonnement: string
  frequenceAbonnement: string
  
  // Contrat
  numeroContrat: string
  statutContrat: string
  typeProprietaire: string
  dateDebutContrat: string
  dateFinContrat: string
  
  // Entreprise
  nomEntreprise: string
  siret: string
  contactEmail: string
  contactTelephone: string
  
  // Facturation
  numeroFacture: string
  montantHT: string
  dateEmission: string
  dateEcheance: string
  
  // Interventions
  typeIntervention: string
  statutIntervention: string
  datePlanifiee: string
  dateRealisee: string
}

const emit = defineEmits<{
  search: [filters: SearchForm]
}>()

const isAdvanced = ref(false)

const form = reactive<SearchForm>({
  // Identité
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  role: '',
  statut: '',
  
  // Adresse
  ligne1: '',
  ligne2: '',
  codePostal: '',
  ville: '',
  pays: '',
  typeAdresse: '',
  
  // Compteur et Abonnement
  numeroCompteur: '',
  typeCompteur: '',
  statutCompteur: '',
  emplacementCompteur: '',
  dateDebutAbonnement: '',
  dateFinAbonnement: '',
  frequenceAbonnement: '',
  
  // Contrat
  numeroContrat: '',
  statutContrat: '',
  typeProprietaire: '',
  dateDebutContrat: '',
  dateFinContrat: '',
  
  // Entreprise
  nomEntreprise: '',
  siret: '',
  contactEmail: '',
  contactTelephone: '',
  
  // Facturation
  numeroFacture: '',
  montantHT: '',
  dateEmission: '',
  dateEcheance: '',
  
  // Interventions
  typeIntervention: '',
  statutIntervention: '',
  datePlanifiee: '',
  dateRealisee: ''
})

function toggleAdvanced() {
  isAdvanced.value = !isAdvanced.value
}

function onSearch() {
  // Filtrer les champs vides
  const filters = Object.fromEntries(
    Object.entries(form).filter(([_, value]) => value !== '')
  )
  
  emit('search', filters as SearchForm)
}

function resetForm() {
  Object.keys(form).forEach(key => {
    form[key as keyof SearchForm] = ''
  })
}
</script> 