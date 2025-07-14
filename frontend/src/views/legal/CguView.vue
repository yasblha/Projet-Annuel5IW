<template>
  <div class="bg-white min-h-screen">
    <!-- Header avec breadcrumb -->
    <div class="bg-blue-50 py-6 border-b">
      <div class="max-w-5xl mx-auto px-4">
        <div class="flex items-center text-sm text-gray-600 mb-2">
          <router-link to="/" class="hover:text-blue-600">Accueil</router-link>
          <span class="mx-2">/</span>
          <span class="text-gray-800">Conditions Générales</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Conditions Générales d'Utilisation et de Vente</h1>
        <p class="text-gray-600 mt-2">Dernière mise à jour : 14 juillet 2025</p>
      </div>
    </div>
    
    <!-- Contenu principal -->
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="prose max-w-none">
        <h2>1. Acceptation des conditions</h2>
        <p>En accédant et en utilisant la plateforme Billing System, vous acceptez d'être légalement lié par les présentes Conditions Générales d'Utilisation et de Vente. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.</p>
        
        <h2>2. Description du service</h2>
        <p>Billing System est une plateforme SaaS (Software as a Service) de gestion de facturation d'eau, permettant aux collectivités, entreprises et opérateurs de gérer leurs contrats, compteurs, factures, paiements et interventions.</p>
        
        <h2>3. Compte utilisateur</h2>
        <p>Pour utiliser pleinement notre service, vous devez créer un compte. Vous êtes responsable du maintien de la confidentialité de vos identifiants et de toutes les activités qui se produisent sous votre compte.</p>
        <p>Conformément aux recommandations de la CNIL :</p>
        <ul>
          <li>Votre mot de passe doit comporter au moins 12 caractères incluant des lettres majuscules, minuscules, des chiffres et des caractères spéciaux</li>
          <li>Une réinitialisation de votre mot de passe sera demandée tous les 60 jours</li>
          <li>Votre compte sera temporairement bloqué après plusieurs tentatives de connexion échouées</li>
        </ul>
        
        <h2>4. Conditions tarifaires</h2>
        <p>L'utilisation de Billing System est soumise à l'abonnement à l'une de nos offres. Les tarifs sont indiqués hors taxes et peuvent être modifiés à tout moment. Tout mois entamé est dû dans son intégralité.</p>
        
        <h2>5. Propriété intellectuelle</h2>
        <p>L'ensemble des éléments constituant Billing System (textes, graphiques, logiciels, etc.) sont la propriété exclusive de notre société et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
        
        <h2>6. Protection des données</h2>
        <p>Nous nous engageons à protéger votre vie privée. Pour plus d'informations sur la façon dont nous collectons, utilisons et protégeons vos données, veuillez consulter notre <router-link to="/privacy" class="text-blue-600 hover:underline">Politique de confidentialité</router-link>.</p>
        
        <h2>7. Limitation de responsabilité</h2>
        <p>Nous mettons tout en œuvre pour assurer la disponibilité et la fiabilité de nos services, mais ne pouvons garantir un fonctionnement sans interruption ni erreur. Notre responsabilité ne saurait être engagée en cas de dommages indirects résultant de l'utilisation de notre plateforme.</p>
        
        <h2>8. Résiliation</h2>
        <p>Nous nous réservons le droit de suspendre ou de résilier votre accès au service en cas de violation des présentes conditions. Vous pouvez également résilier votre abonnement à tout moment, conformément aux modalités de votre contrat.</p>
        
        <h2>9. Modifications des conditions</h2>
        <p>Nous nous réservons le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés des modifications substantielles avant leur entrée en vigueur.</p>
        
        <h2>10. Droit applicable</h2>
        <p>Les présentes conditions sont régies par le droit français. Tout litige relatif à leur interprétation ou à leur exécution relève, à défaut d'accord amiable, de la compétence exclusive des tribunaux français.</p>
        
        <h2>11. Contact</h2>
        <p>Pour toute question concernant ces conditions, veuillez nous contacter via notre <router-link to="/contact" class="text-blue-600 hover:underline">formulaire de contact</router-link> ou à l'adresse email : contact@billingsystem.fr</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Mettre à jour le titre de la page
import { onMounted } from 'vue'

onMounted(() => {
  document.title = "Conditions Générales d'Utilisation - Billing System"
})
</script>
