<template>
  <div class="bg-white min-h-screen">
    <!-- Header avec breadcrumb -->
    <div class="bg-blue-50 py-6 border-b">
      <div class="max-w-5xl mx-auto px-4">
        <div class="flex items-center text-sm text-gray-600 mb-2">
          <router-link to="/" class="hover:text-blue-600">Accueil</router-link>
          <span class="mx-2">/</span>
          <span class="text-gray-800">Contact</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Contactez-nous</h1>
        <p class="text-gray-600 mt-2">Notre équipe est à votre disposition pour répondre à toutes vos questions</p>
      </div>
    </div>
    
    <!-- Contenu principal -->
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Formulaire de contact -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-bold mb-4 text-gray-800">Envoyez-nous un message</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="form.firstName"
                  class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="form.lastName"
                  class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="form.email"
                class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
            
            <div>
              <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
              <select 
                id="subject" 
                v-model="form.subject"
                class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                required
              >
                <option value="" disabled selected>Sélectionnez un sujet</option>
                <option value="information">Demande d'information</option>
                <option value="demo">Demande de démonstration</option>
                <option value="support">Support technique</option>
                <option value="partnership">Partenariat</option>
                <option value="other">Autre sujet</option>
              </select>
            </div>
            
            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                id="message" 
                v-model="form.message"
                rows="5"
                class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                required
              ></textarea>
            </div>
            
            <div class="flex items-start">
              <input 
                type="checkbox" 
                id="privacy" 
                v-model="form.privacyConsent"
                class="mt-1"
                required
              />
              <label for="privacy" class="ml-2 text-sm text-gray-600">
                J'accepte que mes données personnelles soient traitées conformément à la 
                <router-link to="/privacy" class="text-blue-600 hover:underline">politique de confidentialité</router-link>
              </label>
            </div>
            
            <div class="pt-2">
              <button 
                type="submit" 
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                :disabled="submitting"
              >
                <span v-if="submitting">Envoi en cours...</span>
                <span v-else>Envoyer le message</span>
              </button>
            </div>
            
            <div v-if="submitStatus" :class="[
              'p-3 rounded-md text-sm', 
              submitStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            ]">
              {{ submitMessage }}
            </div>
          </form>
        </div>
        
        <!-- Informations de contact -->
        <div>
          <div class="bg-blue-50 rounded-lg shadow-sm border p-6 mb-6">
            <h2 class="text-xl font-bold mb-4 text-gray-800">Informations de contact</h2>
            <div class="space-y-4">
              <div class="flex items-start">
                <div class="mt-1 mr-3 bg-blue-100 p-2 rounded-full text-blue-600">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <h3 class="font-medium text-gray-700">Adresse</h3>
                  <p class="text-gray-600">
                    123 Avenue de la République<br>
                    75011 Paris, France
                  </p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="mt-1 mr-3 bg-blue-100 p-2 rounded-full text-blue-600">
                  <i class="fas fa-envelope"></i>
                </div>
                <div>
                  <h3 class="font-medium text-gray-700">Email</h3>
                  <p class="text-gray-600">
                    contact@billingsystem.fr<br>
                    support@billingsystem.fr (support technique)
                  </p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="mt-1 mr-3 bg-blue-100 p-2 rounded-full text-blue-600">
                  <i class="fas fa-phone-alt"></i>
                </div>
                <div>
                  <h3 class="font-medium text-gray-700">Téléphone</h3>
                  <p class="text-gray-600">
                    +33 (0)1 23 45 67 89<br>
                    Lun-Ven: 9h-18h
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-xl font-bold mb-4 text-gray-800">Nos horaires</h2>
            <ul class="space-y-2">
              <li class="flex justify-between">
                <span class="font-medium">Lundi - Vendredi</span>
                <span>09:00 - 18:00</span>
              </li>
              <li class="flex justify-between">
                <span class="font-medium">Samedi</span>
                <span>Fermé</span>
              </li>
              <li class="flex justify-between">
                <span class="font-medium">Dimanche</span>
                <span>Fermé</span>
              </li>
            </ul>
            <div class="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
              <p>Support technique disponible 24/7 pour nos clients via l'espace client.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onMounted } from 'vue'

// Mettre à jour le titre de la page
onMounted(() => {
  document.title = "Contact - Billing System"
})

// État du formulaire
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  message: '',
  privacyConsent: false
})

// État de soumission
const submitting = ref(false)
const submitStatus = ref('')
const submitMessage = ref('')

// Gestion de la soumission du formulaire
const handleSubmit = async () => {
  submitting.value = true
  
  try {
    // Dans une application réelle, il faudrait appeler une API ici
    // await api.sendContactForm(form)
    
    // Simulation d'une requête API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Succès
    submitStatus.value = 'success'
    submitMessage.value = "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais."
    
    // Réinitialiser le formulaire
    Object.keys(form).forEach(key => {
      if (key !== 'privacyConsent') {
        form[key] = ''
      }
    })
  } catch (error) {
    // Échec
    submitStatus.value = 'error'
    submitMessage.value = "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer ultérieurement."
    console.error('Error submitting form:', error)
  } finally {
    submitting.value = false
  }
}
</script>
