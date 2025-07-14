<template>
  <div class="bg-white min-h-screen">
    <!-- Header avec breadcrumb -->
    <div class="bg-blue-50 py-6 border-b">
      <div class="max-w-5xl mx-auto px-4">
        <div class="flex items-center text-sm text-gray-600 mb-2">
          <router-link to="/" class="hover:text-blue-600">Accueil</router-link>
          <span class="mx-2">/</span>
          <span class="text-gray-800">Politique de confidentialité</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Politique de confidentialité</h1>
        <p class="text-gray-600 mt-2">Dernière mise à jour : 14 juillet 2025</p>
      </div>
    </div>
    
    <!-- Contenu principal -->
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="prose max-w-none">
        <h2>Introduction</h2>
        <p>Billing System s'engage à protéger la vie privée des utilisateurs de sa plateforme conformément au Règlement Général sur la Protection des Données (RGPD) et à la législation française applicable. Cette politique de confidentialité décrit comment nous collectons, utilisons, partageons et protégeons vos informations personnelles.</p>
        
        <h2>1. Données collectées</h2>
        <p>Nous collectons les types d'informations suivants :</p>
        <ul>
          <li><strong>Données d'identification</strong> : nom, prénom, adresse email, numéro de téléphone</li>
          <li><strong>Données professionnelles</strong> : entreprise, fonction, secteur d'activité</li>
          <li><strong>Données de facturation</strong> : coordonnées bancaires, historique des paiements</li>
          <li><strong>Données d'utilisation</strong> : logs de connexion, actions effectuées sur la plateforme</li>
          <li><strong>Données techniques</strong> : adresse IP, type de navigateur, appareil utilisé</li>
        </ul>
        
        <h2>2. Finalités du traitement</h2>
        <p>Nous traitons vos données pour les finalités suivantes :</p>
        <ul>
          <li>Fourniture et gestion de nos services (contrats, facturation, interventions)</li>
          <li>Authentification et sécurisation de votre compte</li>
          <li>Communication concernant votre compte et nos services</li>
          <li>Amélioration de nos services et de votre expérience utilisateur</li>
          <li>Respect de nos obligations légales et réglementaires</li>
        </ul>
        
        <h2>3. Base légale du traitement</h2>
        <p>Nous traitons vos données personnelles sur les bases légales suivantes :</p>
        <ul>
          <li><strong>Exécution du contrat</strong> : pour vous fournir les services demandés</li>
          <li><strong>Consentement</strong> : lorsque vous nous le donnez explicitement</li>
          <li><strong>Intérêt légitime</strong> : pour améliorer nos services et assurer leur sécurité</li>
          <li><strong>Obligation légale</strong> : lorsque la loi nous y oblige</li>
        </ul>
        
        <h2>4. Conservation des données</h2>
        <p>Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, conformément aux exigences légales et réglementaires :</p>
        <ul>
          <li>Données de compte : pendant toute la durée de votre relation contractuelle avec nous, puis archivées pour une durée de 5 ans</li>
          <li>Données de facturation : 10 ans conformément aux obligations comptables et fiscales</li>
          <li>Logs de connexion : 1 an</li>
        </ul>
        
        <h2>5. Partage des données</h2>
        <p>Nous pouvons partager vos données avec :</p>
        <ul>
          <li>Nos sous-traitants (hébergement, maintenance, support) qui agissent selon nos instructions et dans le respect du RGPD</li>
          <li>Les autorités administratives ou judiciaires lorsque la loi l'exige</li>
        </ul>
        <p>Nous ne vendons jamais vos données personnelles à des tiers.</p>
        
        <h2>6. Sécurité des données</h2>
        <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'accès non autorisé, la divulgation ou l'altération :</p>
        <ul>
          <li>Chiffrement des données sensibles</li>
          <li>Authentification forte</li>
          <li>Contrôle des accès</li>
          <li>Audits de sécurité réguliers</li>
          <li>Sauvegarde des données selon le principe 3-2-1</li>
        </ul>
        
        <h2>7. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :</p>
        <ul>
          <li><strong>Droit d'accès</strong> : obtenir une copie des données que nous détenons</li>
          <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
          <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
          <li><strong>Droit à la limitation du traitement</strong> : restreindre l'utilisation de vos données</li>
          <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
          <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
        </ul>
        <p>Pour exercer ces droits, veuillez nous contacter via notre <router-link to="/contact" class="text-blue-600 hover:underline">formulaire de contact</router-link> ou à l'adresse email : dpo@billingsystem.fr</p>
        
        <h2>8. Cookies et technologies similaires</h2>
        <p>Notre site utilise des cookies et technologies similaires pour améliorer votre expérience. Pour plus d'informations sur notre utilisation des cookies, consultez notre <strong>Politique de cookies</strong>.</p>
        
        <h2>9. Transferts internationaux de données</h2>
        <p>Vos données sont principalement stockées et traitées dans l'Union européenne. Si des transferts vers des pays tiers sont nécessaires, nous veillons à ce qu'ils offrent un niveau de protection adéquat conformément aux exigences du RGPD.</p>
        
        <h2>10. Délégué à la protection des données</h2>
        <p>Nous avons désigné un Délégué à la Protection des Données (DPO) que vous pouvez contacter pour toute question relative à la protection de vos données : dpo@billingsystem.fr</p>
        
        <h2>11. Droit d'introduire une réclamation</h2>
        <p>Si vous estimez que le traitement de vos données personnelles n'est pas conforme à la réglementation, vous avez le droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) : <a href="https://www.cnil.fr" target="_blank" class="text-blue-600 hover:underline">www.cnil.fr</a></p>
        
        <h2>12. Modifications de la politique</h2>
        <p>Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. La version mise à jour sera publiée sur notre site avec la date de dernière mise à jour.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Mettre à jour le titre de la page
import { onMounted } from 'vue'

onMounted(() => {
  document.title = "Politique de confidentialité - Billing System"
})
</script>
