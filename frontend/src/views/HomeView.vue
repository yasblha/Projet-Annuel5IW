<template>
  <div class="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col">
    <!-- Barre de navigation -->
    <nav class="w-full bg-white shadow-sm sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fas fa-tint text-blue-600 text-2xl"></i>
          <span class="font-bold text-xl text-gray-800">Billing System</span>
        </div>
        <div class="flex items-center gap-4">
          <a href="#features" class="text-gray-700 hover:text-blue-600 font-medium">Fonctionnalités</a>
          <a href="#about" class="text-gray-700 hover:text-blue-600 font-medium">À propos</a>
          <a href="#contact" class="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
          <template v-if="isAuthenticated">
            <router-link to="/hub" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Mon espace</router-link>
            <span class="text-sm text-gray-600 ml-2">Connecté en tant que <b>{{ userFullName }}</b></span>
          </template>
          <template v-else>
            <router-link to="/login" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Connexion</router-link>
            <router-link to="/register" class="ml-2 px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">Inscription</router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- Hero section -->
    <section class="flex-1 flex flex-col justify-center items-center text-center py-16 bg-gradient-to-b from-blue-100 to-white">
      <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
        Plateforme moderne de <span class="text-blue-600">Facturation de l'Eau</span>
      </h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
        Gérez agences, contrats, factures, interventions et clients avec une solution modulaire, sécurisée et intuitive.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link to="/register" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition">Créer un compte</router-link>
        <router-link to="/login" class="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition">Se connecter</router-link>
      </div>
      <div v-if="isAuthenticated" class="mt-6 text-green-700 flex items-center justify-center gap-2">
        <i class="fas fa-check-circle"></i> Vous êtes connecté !
      </div>
    </section>

    <!-- Fonctionnalités -->
    <section id="features" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-10">Fonctionnalités principales</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-blue-50 rounded-lg p-6 shadow hover:shadow-lg transition">
            <i class="fas fa-shield-alt text-blue-600 text-3xl mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Sécurité avancée</h3>
            <p class="text-gray-600">Authentification forte, gestion des rôles, RGPD, blocage automatique, réinitialisation sécurisée.</p>
          </div>
          <div class="bg-blue-50 rounded-lg p-6 shadow hover:shadow-lg transition">
            <i class="fas fa-file-invoice-dollar text-blue-600 text-3xl mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Facturation & Paiement</h3>
            <p class="text-gray-600">Facturation manuelle/automatique, paiements multiples, relances, échéanciers, duplicatas.</p>
          </div>
          <div class="bg-blue-50 rounded-lg p-6 shadow hover:shadow-lg transition">
            <i class="fas fa-cogs text-blue-600 text-3xl mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Interventions & Workflows</h3>
            <p class="text-gray-600">Planification intelligente, suivi des incidents, workflows métiers, questionnaires dynamiques.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pourquoi choisir notre solution -->
    <section class="py-16 bg-gradient-to-b from-white to-blue-50">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-10">Pourquoi choisir notre solution&nbsp;?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white rounded-lg p-6 shadow flex flex-col items-center">
            <i class="fas fa-bolt text-yellow-500 text-3xl mb-4"></i>
            <h3 class="text-lg font-semibold mb-2">Rapidité & Simplicité</h3>
            <p class="text-gray-600 text-center">Interface intuitive, prise en main rapide, automatisation des tâches répétitives.</p>
          </div>
          <div class="bg-white rounded-lg p-6 shadow flex flex-col items-center">
            <i class="fas fa-users text-blue-500 text-3xl mb-4"></i>
            <h3 class="text-lg font-semibold mb-2">Collaboration</h3>
            <p class="text-gray-600 text-center">Gestion multi-agences, multi-utilisateurs, rôles et permissions avancés.</p>
          </div>
          <div class="bg-white rounded-lg p-6 shadow flex flex-col items-center">
            <i class="fas fa-chart-line text-green-500 text-3xl mb-4"></i>
            <h3 class="text-lg font-semibold mb-2">Suivi & Analyse</h3>
            <p class="text-gray-600 text-center">Tableaux de bord, statistiques, export de données, alertes personnalisées.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- À propos -->
    <section id="about" class="py-16 bg-white">
      <div class="max-w-5xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">À propos du projet</h2>
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="flex-1">
            <img src="../assets/aquaerp_logo.svg" alt="Schéma du projet" class="rounded-lg shadow w-full max-w-md mx-auto" />
          </div>
          <div class="flex-1">
            <p class="text-lg text-gray-700 mb-4">
              <b>Billing System</b> est une plateforme SaaS de gestion de facturation d’eau, pensée pour les collectivités, entreprises et opérateurs. Elle permet de gérer l’ensemble du cycle de vie client : abonnements, contrats, compteurs, factures, paiements, interventions, et bien plus.
            </p>
            <ul class="list-disc pl-6 text-gray-700 space-y-2">
              <li>Architecture microservices moderne (NestJS, Vue.js, Docker)</li>
              <li>API sécurisée, scalable et performante</li>
              <li>Support multi-tenant, multi-rôles, multi-agences</li>
              <li>Support et documentation complète</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div class="max-w-3xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">Contact & Démo</h2>
        <form class="bg-white rounded-lg shadow p-8 flex flex-col gap-4 max-w-xl mx-auto">
          <div class="flex gap-4">
            <input type="text" placeholder="Nom" class="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            <input type="email" placeholder="Email" class="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <textarea placeholder="Votre message" rows="4" class="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"></textarea>
          <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Envoyer</button>
        </form>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white border-t py-8 mt-8">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Main Footer -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div class="flex items-center gap-2">
            <i class="fas fa-tint text-blue-600 text-xl"></i>
            <span class="font-bold text-xl text-gray-700">Billing System</span>
          </div>
          <div class="flex flex-wrap justify-center gap-6">
            <div class="flex flex-col">
              <h4 class="font-semibold text-gray-800 mb-2">Navigation</h4>
              <a href="#features" class="text-gray-600 hover:text-blue-600 mb-1">Fonctionnalités</a>
              <a href="#about" class="text-gray-600 hover:text-blue-600 mb-1">À propos</a>
              <a href="#contact" class="text-gray-600 hover:text-blue-600 mb-1">Contact</a>
            </div>
            <div class="flex flex-col">
              <h4 class="font-semibold text-gray-800 mb-2">Légal</h4>
              <router-link to="/cgu" class="text-gray-600 hover:text-blue-600 mb-1">CGU/CGV</router-link>
              <router-link to="/privacy" class="text-gray-600 hover:text-blue-600 mb-1">Confidentialité</router-link>
              <router-link to="/contact" class="text-gray-600 hover:text-blue-600 mb-1">Nous contacter</router-link>
            </div>
          </div>
        </div>
        
        <!-- Copyright -->
        <div class="border-t pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-gray-500 text-sm">&copy; {{ new Date().getFullYear() }} - Billing System - Tous droits réservés</div>
          <div class="flex items-center gap-4">
            <a href="#" class="text-gray-500 hover:text-blue-600">
              <i class="fab fa-linkedin text-lg"></i>
            </a>
            <a href="#" class="text-gray-500 hover:text-blue-600">
              <i class="fab fa-twitter text-lg"></i>
            </a>
            <a href="#" class="text-gray-500 hover:text-blue-600">
              <i class="fab fa-github text-lg"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userFullName = computed(() => authStore.userFullName)
</script>

<style scoped>
html, body {
  background: #f8fafc;
}
</style>