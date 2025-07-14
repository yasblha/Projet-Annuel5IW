<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Offre & devis</h2>
      <p class="text-gray-600">Générez un devis personnalisé et visualisez l'offre</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Configuration tarification -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Type de tarification *
              </label>
              <select
                v-model="form.tarification.type"
                @change="calculateQuote"
                :class="[
                  'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.tarification?.type ? 'border-red-500' : 'border-gray-300'
                ]"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
              </select>
              <p v-if="errors.tarification?.type" class="mt-1 text-sm text-red-600">
                {{ errors.tarification.type }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Consommation estimée (m³/an)
              </label>
              <input
                v-model="form.consommationEstimee"
                type="number"
                min="0"
                @input="calculateQuote"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Durée du contrat (années)
              </label>
              <select
                v-model="form.dureeContrat"
                @change="calculateQuote"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">1 an</option>
                <option value="2">2 ans</option>
                <option value="3">3 ans</option>
                <option value="5">5 ans</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Options supplémentaires
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="form.options.assurance"
                    type="checkbox"
                    @change="calculateQuote"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Assurance compteur (+15€/an)</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.options.maintenance"
                    type="checkbox"
                    @change="calculateQuote"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Maintenance préventive (+25€/an)</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.options.telemetrie"
                    type="checkbox"
                    @change="calculateQuote"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Télémétrie (+10€/an)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Bouton générer devis -->
        <div class="flex justify-center">
          <button
            type="button"
            @click="generateQuote"
            :disabled="isGeneratingQuote"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isGeneratingQuote" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isGeneratingQuote ? 'Génération...' : 'Générer le devis' }}
          </button>
        </div>
      </div>

      <!-- Devis et montants -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Devis détaillé</h3>
          
          <div v-if="quote" class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h4 class="text-lg font-medium text-gray-900">Devis #{{ quote.devisId }}</h4>
              <p class="text-sm text-gray-500">{{ new Date().toLocaleDateString() }}</p>
            </div>
            
            <div class="px-6 py-4 space-y-4">
              <!-- Détail des coûts -->
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Abonnement mensuel</span>
                  <span class="text-sm font-medium">{{ quote.tarification.montantMensuel }}€</span>
                </div>
                
                <div v-if="form.options.assurance" class="flex justify-between">
                  <span class="text-sm text-gray-600">Assurance compteur</span>
                  <span class="text-sm font-medium">15€/an</span>
                </div>
                
                <div v-if="form.options.maintenance" class="flex justify-between">
                  <span class="text-sm text-gray-600">Maintenance préventive</span>
                  <span class="text-sm font-medium">25€/an</span>
                </div>
                
                <div v-if="form.options.telemetrie" class="flex justify-between">
                  <span class="text-sm text-gray-600">Télémétrie</span>
                  <span class="text-sm font-medium">10€/an</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Frais d'installation</span>
                  <span class="text-sm font-medium">{{ quote.fraisInstallation }}€</span>
                </div>
              </div>
              
              <div class="border-t border-gray-200 pt-4">
                <div class="flex justify-between text-lg font-bold">
                  <span>Total annuel</span>
                  <span>{{ quote.montantTotal }}€</span>
                </div>
                <div class="flex justify-between text-sm text-gray-500">
                  <span>Total sur {{ form.dureeContrat }} an(s)</span>
                  <span>{{ quote.montantTotal * parseInt(form.dureeContrat) }}€</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions devis -->
          <div v-if="quote" class="mt-4 space-y-3">
            <button
              type="button"
              @click="downloadPdf"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Télécharger PDF
            </button>
            
            <button
              type="button"
              @click="previewPdf"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              Aperçu devis
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between mt-8">
      <button 
        type="button" 
        @click="$emit('previous')"
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Précédent
      </button>
      
      <button 
        type="submit"
        @click="handleSubmit"
        :disabled="!isValid || isLoading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? 'Chargement...' : 'Suivant' }}
        <svg class="-mr-1 ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue'
import { z } from 'zod'

// Props & Emits
const props = defineProps<{
  formData: any
}>()

const emit = defineEmits<{
  'update:formData': [data: any]
  'next': []
  'previous': []
}>()

// Reactive state
const form = ref({
  tarification: {
    type: '',
    montantMensuel: 0
  },
  consommationEstimee: 120,
  dureeContrat: '1',
  options: {
    assurance: false,
    maintenance: false,
    telemetrie: false
  }
})

const quote = ref<any>(null)
const isGeneratingQuote = ref(false)
const isLoading = ref(false)
const errors = ref<Record<string, any>>({})

// Validation schema
const QuoteSchema = z.object({
  tarification: z.object({
    type: z.enum(['STANDARD', 'PREMIUM']),
    montantMensuel: z.number().positive()
  }),
  consommationEstimee: z.number().min(0),
  dureeContrat: z.string(),
  options: z.object({
    assurance: z.boolean(),
    maintenance: z.boolean(),
    telemetrie: z.boolean()
  })
})

// Computed
const isValid = computed(() => {
  try {
    QuoteSchema.parse(form.value)
    return quote.value !== null
  } catch {
    return false
  }
})

// Methods
const calculateQuote = () => {
  if (!form.value.tarification.type) return
  
  const baseMontant = form.value.tarification.type === 'STANDARD' ? 25 : 35
  let total = baseMontant * 12 // Annuel
  
  // Options
  if (form.value.options.assurance) total += 15
  if (form.value.options.maintenance) total += 25
  if (form.value.options.telemetrie) total += 10
  
  // Remplacer l'objet tarification pour éviter la mutation sur proxy readonly
  form.value.tarification = {
    ...toRaw(form.value.tarification),
    montantMensuel: baseMontant
  }
}

const generateQuote = async () => {
  if (!form.value.tarification.type) return
  
  isGeneratingQuote.value = true
  try {
    // Simuler appel API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    calculateQuote()
    
    quote.value = {
      devisId: 'DEV-' + Date.now(),
      montantTotal: form.value.tarification.montantMensuel * 12 + 
        (form.value.options.assurance ? 15 : 0) +
        (form.value.options.maintenance ? 25 : 0) +
        (form.value.options.telemetrie ? 10 : 0),
      tarification: form.value.tarification,
      fraisInstallation: 150,
      dateCreation: new Date().toISOString()
    }
  } catch (error) {
    console.error('Erreur génération devis:', error)
  } finally {
    isGeneratingQuote.value = false
  }
}

const downloadPdf = () => {
  // Créer un contenu de PDF plus complet avec toutes les données du devis
  const pdfContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { text-align: center; margin-bottom: 20px; }
          .client-info { margin-bottom: 15px; }
          .quote-details { margin-bottom: 15px; }
          .meter-info { margin-bottom: 15px; }
          .total { font-weight: bold; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Devis - ${formData.quote?.reference || 'Réf. non disponible'}</h1>
          <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div class="client-info">
          <h2>Informations client</h2>
          <p>Nom: ${formData.clientIdentity?.nom || ''} ${formData.clientIdentity?.prenom || ''}</p>
          <p>Email: ${formData.clientIdentity?.email || ''}</p>
          <p>Téléphone: ${formData.clientIdentity?.telephone || ''}</p>
          <p>Adresse: ${formData.eligibility?.adresse?.rue || ''}, 
                      ${formData.eligibility?.adresse?.codePostal || ''} 
                      ${formData.eligibility?.adresse?.ville || ''}</p>
        </div>
        
        <div class="meter-info">
          <h2>Information compteur</h2>
          <p>Type: ${formData.meter?.type || 'Non spécifié'}</p>
          <p>Numéro: ${formData.meter?.numero || 'Non spécifié'}</p>
          <p>Statut: ${formData.meter?.statut || 'Non spécifié'}</p>
        </div>
        
        <div class="quote-details">
          <h2>Détails du devis</h2>
          <table>
            <tr>
              <th>Description</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
            <tr>
              <td>Offre énergétique - ${formData.quote?.formule || 'Standard'}</td>
              <td>1</td>
              <td>${formData.quote?.prixBase || '0'}€</td>
              <td>${formData.quote?.prixBase || '0'}€</td>
            </tr>
            <tr>
              <td>Options supplémentaires</td>
              <td>${formData.quote?.options?.length || '0'}</td>
              <td>-</td>
              <td>${formData.quote?.prixOptions || '0'}€</td>
            </tr>
          </table>
        </div>
        
        <div class="total">
          <p>Total mensuel estimé: ${formData.quote?.prixTotal || '0'}€</p>
        </div>
        
        <div>
          <p><i>Ce devis est valable 30 jours à compter de sa date d'émission.</i></p>
        </div>
      </body>
    </html>
  `;
  
  // Créer un Blob avec le contenu HTML pour simuler un PDF
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  // Créer un lien et déclencher le téléchargement
  const link = document.createElement('a');
  link.href = url;
  link.download = `Devis_${formData.quote?.reference || 'nouveau'}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const previewPdf = () => {
  // Utiliser le même contenu PDF complet que pour le téléchargement
  const pdfContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { text-align: center; margin-bottom: 20px; }
          .client-info { margin-bottom: 15px; }
          .quote-details { margin-bottom: 15px; }
          .meter-info { margin-bottom: 15px; }
          .total { font-weight: bold; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Devis - ${formData.quote?.reference || 'Réf. non disponible'}</h1>
          <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div class="client-info">
          <h2>Informations client</h2>
          <p>Nom: ${formData.clientIdentity?.nom || ''} ${formData.clientIdentity?.prenom || ''}</p>
          <p>Email: ${formData.clientIdentity?.email || ''}</p>
          <p>Téléphone: ${formData.clientIdentity?.telephone || ''}</p>
          <p>Adresse: ${formData.eligibility?.adresse?.rue || ''}, 
                      ${formData.eligibility?.adresse?.codePostal || ''} 
                      ${formData.eligibility?.adresse?.ville || ''}</p>
        </div>
        
        <div class="meter-info">
          <h2>Information compteur</h2>
          <p>Type: ${formData.meter?.type || 'Non spécifié'}</p>
          <p>Numéro: ${formData.meter?.numero || 'Non spécifié'}</p>
          <p>Statut: ${formData.meter?.statut || 'Non spécifié'}</p>
        </div>
        
        <div class="quote-details">
          <h2>Détails du devis</h2>
          <table>
            <tr>
              <th>Description</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
            <tr>
              <td>Offre énergétique - ${formData.quote?.formule || 'Standard'}</td>
              <td>1</td>
              <td>${formData.quote?.prixBase || '0'}€</td>
              <td>${formData.quote?.prixBase || '0'}€</td>
            </tr>
            <tr>
              <td>Options supplémentaires</td>
              <td>${formData.quote?.options?.length || '0'}</td>
              <td>-</td>
              <td>${formData.quote?.prixOptions || '0'}€</td>
            </tr>
          </table>
        </div>
        
        <div class="total">
          <p>Total mensuel estimé: ${formData.quote?.prixTotal || '0'}€</p>
        </div>
        
        <div>
          <p><i>Ce devis est valable 30 jours à compter de sa date d'émission.</i></p>
        </div>
      </body>
    </html>
  `;
  
  // Créer un Blob et l'ouvrir dans une nouvelle fenêtre
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

const validateForm = () => {
  try {
    QuoteSchema.parse(form.value)
    errors.value = {}
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = {}
      error.errors.forEach(err => {
        if (err.path[0]) {
          const path = err.path.join('.')
          errors.value[path] = err.message
        }
      })
    }
    return false
  }
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  try {
    emit('update:formData', { 
      quote: {
        ...form.value,
        ...quote.value
      }
    })
    emit('next')
  } catch (error) {
    console.error('Erreur soumission:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for form data changes
watch(() => props.formData?.quote, (newData) => {
  if (newData) {
    form.value = { ...form.value, ...newData }
    if (newData.devisId) {
      quote.value = newData
    }
  }
}, { immediate: true })

// Auto-calculate on mount
watch(() => form.value.tarification.type, () => {
  if (form.value.tarification.type) {
    calculateQuote()
  }
})
</script> 