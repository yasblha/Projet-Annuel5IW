<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center space-x-2">
            <img src="../assets/aquaerp_logo_perfect.svg" alt="Logo" class="h-10 w-10" />
            <h1 class="text-2xl font-bold text-gray-900">Billing System</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/login"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Connexion
            </router-link>
            <router-link
              to="/register"
              class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Inscription
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h2 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Plateforme de <span class="text-blue-600">Facturation de l'Eau</span> Moderne
        </h2>
        <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Gérez vos agences, contrats, factures et interventions avec une solution modulaire, sécurisée et intuitive.
        </p>
        <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div class="rounded-md shadow">
            <router-link
              to="/register"
              class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Commencer maintenant
            </router-link>
          </div>
          <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <router-link
              to="/login"
              class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Se connecter
            </router-link>
          </div>
        </div>
      </div>

      <!-- Features -->
      <section class="mt-16">
        <h3 class="text-2xl font-bold text-gray-900 text-center mb-8">Fonctionnalités principales</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <span class="text-blue-600 text-4xl mb-2">🔐</span>
            <h4 class="font-semibold text-lg mb-2">Sécurité avancée</h4>
            <p class="text-gray-600 text-center">Authentification forte, gestion des rôles, RGPD, blocage automatique, réinitialisation sécurisée.</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <span class="text-green-600 text-4xl mb-2">📄</span>
            <h4 class="font-semibold text-lg mb-2">Gestion des contrats</h4>
            <p class="text-gray-600 text-center">Contrats individuels, collectifs, co-signataires, tarification dynamique, cycle de vie complet.</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <span class="text-purple-600 text-4xl mb-2">💳</span>
            <h4 class="font-semibold text-lg mb-2">Facturation & Paiement</h4>
            <p class="text-gray-600 text-center">Facturation manuelle/automatique, paiements multiples, relances, échéanciers, duplicatas.</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <span class="text-orange-500 text-4xl mb-2">🔧</span>
            <h4 class="font-semibold text-lg mb-2">Interventions & Workflows</h4>
            <p class="text-gray-600 text-center">Planification intelligente, suivi des incidents, workflows métiers, questionnaires dynamiques.</p>
          </div>
        </div>
      </section>

      <!-- Call to action -->
      <section class="mt-16 text-center">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Prêt à digitaliser la gestion de l'eau ?</h3>
        <router-link
          to="/register"
          class="inline-block bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition"
        >
          Créer un compte gratuitement
        </router-link>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-16">
      <div class="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
        <div>
          © {{ new Date().getFullYear() }} Billing System. Tous droits réservés.
        </div>
        <div class="flex space-x-4 mt-2 md:mt-0">
          <router-link to="/legal" class="hover:underline">Mentions légales</router-link>
          <router-link to="/contact" class="hover:underline">Contact</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed for the home page
</script> 