# Système de Formulaires Dynamiques

## 🎯 Vue d'ensemble

Le système de formulaires dynamiques permet de créer des formulaires réutilisables et configurables sans avoir à écrire de code HTML répétitif. Il suffit de définir une configuration et le composant `DynamicForm` génère automatiquement le formulaire correspondant.

**Avantages principaux :**
- ✅ Création rapide de formulaires
- ✅ Interface cohérente dans toute l'application
- ✅ Validation automatique
- ✅ Responsive et accessible
- ✅ Réutilisable et maintenable

## 📦 Architecture du système

```
frontend/src/
├── components/ui/
│   └── DynamicForm.vue          # Composant principal
├── config/
│   └── formConfigs.ts           # Configurations prédéfinies
├── views/dashboard/
│   ├── FormExampleView.vue      # Page de démonstration
│   └── UsersView.vue            # Exemple d'intégration
└── docs/
    └── DynamicForms.md          # Cette documentation
```

## 🚀 Guide d'utilisation pas à pas

### Étape 1 : Import des composants

Dans votre fichier Vue, importez le composant et les configurations :

```vue
<script setup lang="ts">
// Import du composant principal
import DynamicForm from '@/components/ui/DynamicForm.vue'

// Import des configurations prédéfinies
import { formConfigs } from '@/config/formConfigs'
</script>
```

### Étape 2 : Utilisation basique

Utilisez le composant dans votre template :

```vue
<template>
  <div class="p-6">
    <DynamicForm 
      :config="formConfigs.createUser"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import DynamicForm from '@/components/ui/DynamicForm.vue'
import { formConfigs } from '@/config/formConfigs'

function handleSubmit(data: Record<string, any>) {
  console.log('Données du formulaire:', data)
  // Ici vous pouvez faire votre appel API
  // await api.createUser(data)
}
</script>
```

### Étape 3 : Gestion des événements

Le composant émet plusieurs événements que vous pouvez écouter :

```vue
<template>
  <DynamicForm 
    :config="formConfigs.createUser"
    :initial-data="userData"
    @submit="handleSubmit"
    @reset="handleReset"
    @update:modelValue="handleChange"
  />
</template>

<script setup lang="ts">
function handleSubmit(data: Record<string, any>) {
  // Déclenché quand l'utilisateur soumet le formulaire
  console.log('Soumission:', data)
}

function handleReset() {
  // Déclenché quand l'utilisateur clique sur "Réinitialiser"
  console.log('Formulaire réinitialisé')
}

function handleChange(data: Record<string, any>) {
  // Déclenché à chaque modification d'un champ
  console.log('Données mises à jour:', data)
}
</script>
```

## 📋 Formulaires prédéfinis disponibles

Le système inclut des configurations prêtes à l'emploi pour tous les cas d'usage courants :

### 👥 Gestion des utilisateurs
```typescript
formConfigs.createUser    // Créer un nouvel utilisateur
formConfigs.editUser      // Modifier un utilisateur existant
formConfigs.profile       // Modifier son propre profil
formConfigs.changePassword // Changer son mot de passe
```

### 📄 Gestion des contrats
```typescript
formConfigs.createContract // Créer un nouveau contrat
```

### 🔧 Gestion des compteurs
```typescript
formConfigs.createCompteur // Créer un nouveau compteur
```

### 📅 Gestion des abonnements
```typescript
formConfigs.createAbonnement // Créer un nouvel abonnement
```

### 🛠️ Gestion des interventions
```typescript
formConfigs.createIntervention // Créer une nouvelle intervention
```

### 🧾 Gestion des factures
```typescript
formConfigs.createFacture // Créer une nouvelle facture
```

### 📧 Contact
```typescript
formConfigs.contact // Formulaire de contact
```

## 🎯 Exemples concrets d'utilisation

### Exemple 1 : Création d'utilisateur dans un modal

```vue
<template>
  <div>
    <!-- Bouton pour ouvrir le modal -->
    <button @click="showModal = true" class="btn-primary">
      <i class="fas fa-user-plus mr-2"></i>
      Créer un utilisateur
    </button>

    <!-- Modal avec formulaire -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Créer un nouvel utilisateur</h3>
          <button @click="showModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <DynamicForm 
          :config="formConfigs.createUser"
          @submit="createUser"
          @reset="showModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DynamicForm from '@/components/ui/DynamicForm.vue'
import { formConfigs } from '@/config/formConfigs'

const showModal = ref(false)

async function createUser(userData: Record<string, any>) {
  try {
    // Appel API pour créer l'utilisateur
    await api.createUser(userData)
    
    // Fermer le modal et rafraîchir la liste
    showModal.value = false
    await loadUsers()
    
    // Notification de succès
    showNotification('Utilisateur créé avec succès', 'success')
  } catch (error) {
    showNotification('Erreur lors de la création', 'error')
  }
}
</script>
```

### Exemple 2 : Édition d'utilisateur avec données pré-remplies

```vue
<template>
  <div>
    <DynamicForm 
      :config="formConfigs.editUser"
      :initial-data="userToEdit"
      @submit="updateUser"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DynamicForm from '@/components/ui/DynamicForm.vue'
import { formConfigs } from '@/config/formConfigs'

// Données de l'utilisateur à modifier
const userToEdit = ref({
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@email.com',
  telephone: '01 23 45 67 89',
  role: 'CLIENT',
  statut: 'ACTIF'
})

async function updateUser(userData: Record<string, any>) {
  try {
    // Appel API pour mettre à jour l'utilisateur
    await api.updateUser(userToEdit.value.id, userData)
    
    // Notification de succès
    showNotification('Utilisateur mis à jour avec succès', 'success')
  } catch (error) {
    showNotification('Erreur lors de la mise à jour', 'error')
  }
}
</script>
```

### Exemple 3 : Formulaire de profil utilisateur

```vue
<template>
  <div class="max-w-2xl mx-auto">
    <DynamicForm 
      :config="formConfigs.profile"
      :initial-data="userProfile"
      @submit="updateProfile"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DynamicForm from '@/components/ui/DynamicForm.vue'
import { formConfigs } from '@/config/formConfigs'

const userProfile = ref({})

onMounted(async () => {
  // Charger les données du profil utilisateur
  const profile = await api.getUserProfile()
  userProfile.value = profile
})

async function updateProfile(profileData: Record<string, any>) {
  try {
    await api.updateProfile(profileData)
    showNotification('Profil mis à jour avec succès', 'success')
  } catch (error) {
    showNotification('Erreur lors de la mise à jour', 'error')
  }
}
</script>
```

## ⚙️ Configuration personnalisée

### Créer une nouvelle configuration

Si vous avez besoin d'un formulaire spécifique, vous pouvez créer votre propre configuration :

```typescript
// Dans votre composant ou dans formConfigs.ts
const customFormConfig: FormConfig = {
  title: 'Mon formulaire personnalisé',
  description: 'Description de mon formulaire',
  icon: 'fas fa-cog',
  submitText: 'Enregistrer',
  submitIcon: 'fas fa-save',
  showReset: true,
  layout: 'grid',
  gridCols: 2,
  fields: [
    {
      name: 'nom',
      type: 'text',
      label: 'Nom',
      placeholder: 'Votre nom',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50
      }
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'votre@email.com',
      required: true,
      validation: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      }
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rôle',
      required: true,
      options: [
        { value: 'USER', label: 'Utilisateur' },
        { value: 'ADMIN', label: 'Administrateur' }
      ]
    }
  ]
}
```

### Utiliser la configuration personnalisée

```vue
<template>
  <DynamicForm 
    :config="customFormConfig"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import DynamicForm from '@/components/ui/DynamicForm.vue'

// Votre configuration personnalisée
const customFormConfig = {
  // ... configuration
}

function handleSubmit(data: Record<string, any>) {
  console.log('Données du formulaire personnalisé:', data)
}
</script>
```

## 📝 Types de champs détaillés

### Champ texte simple
```typescript
{
  name: 'nom',
  type: 'text',
  label: 'Nom',
  placeholder: 'Votre nom',
  required: true,
  validation: {
    minLength: 2,
    maxLength: 50
  }
}
```

### Champ email avec validation
```typescript
{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'votre@email.com',
  required: true,
  validation: {
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    custom: (value) => {
      if (!value.includes('@')) {
        return 'Email invalide'
      }
      return null
    }
  }
}
```

### Liste déroulante
```typescript
{
  name: 'role',
  type: 'select',
  label: 'Rôle',
  required: true,
  options: [
    { value: 'CLIENT', label: 'Client' },
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'TECHNICIEN', label: 'Technicien' }
  ]
}
```

### Zone de texte
```typescript
{
  name: 'description',
  type: 'textarea',
  label: 'Description',
  placeholder: 'Décrivez votre projet...',
  rows: 4,
  validation: {
    maxLength: 500
  }
}
```

### Champ numérique
```typescript
{
  name: 'age',
  type: 'number',
  label: 'Âge',
  min: 18,
  max: 100,
  step: 1,
  validation: {
    min: 18,
    max: 100
  }
}
```

### Champ date
```typescript
{
  name: 'dateNaissance',
  type: 'date',
  label: 'Date de naissance',
  required: true
}
```

### Case à cocher
```typescript
{
  name: 'conditions',
  type: 'checkbox',
  label: 'J\'accepte les conditions d\'utilisation',
  required: true
}
```

## ✅ Validation avancée

### Validation avec pattern regex
```typescript
{
  name: 'telephone',
  type: 'tel',
  label: 'Téléphone',
  validation: {
    pattern: '^(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}$'
  }
}
```

### Validation personnalisée
```typescript
{
  name: 'password',
  type: 'password',
  label: 'Mot de passe',
  validation: {
    minLength: 8,
    custom: (value) => {
      const hasUpperCase = /[A-Z]/.test(value)
      const hasLowerCase = /[a-z]/.test(value)
      const hasNumbers = /\d/.test(value)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
      
      if (!hasUpperCase) return 'Au moins une majuscule requise'
      if (!hasLowerCase) return 'Au moins une minuscule requise'
      if (!hasNumbers) return 'Au moins un chiffre requis'
      if (!hasSpecialChar) return 'Au moins un caractère spécial requis'
      
      return null
    }
  }
}
```

### Validation croisée
```typescript
{
  name: 'confirmPassword',
  type: 'password',
  label: 'Confirmer le mot de passe',
  validation: {
    custom: (value) => {
      const password = formData?.password
      if (value !== password) {
        return 'Les mots de passe ne correspondent pas'
      }
      return null
    }
  }
}
```

## 🎨 Layouts et personnalisation

### Layout en grille (2 colonnes)
```typescript
{
  layout: 'grid',
  gridCols: 2,
  fields: [
    // Les champs s'afficheront sur 2 colonnes
  ]
}
```

### Layout en grille (3 colonnes)
```typescript
{
  layout: 'grid',
  gridCols: 3,
  fields: [
    // Les champs s'afficheront sur 3 colonnes
  ]
}
```

### Champ qui occupe plusieurs colonnes
```typescript
{
  name: 'description',
  type: 'textarea',
  label: 'Description',
  layout: { span: 2 }, // Occupe 2 colonnes
  rows: 4
}
```

## 🔧 Intégration avec l'API

### Exemple complet avec gestion d'erreurs
```vue
<template>
  <div class="p-6">
    <DynamicForm 
      :config="formConfigs.createUser"
      @submit="createUser"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DynamicForm from '@/components/ui/DynamicForm.vue'
import { formConfigs } from '@/config/formConfigs'

const isLoading = ref(false)

async function createUser(userData: Record<string, any>) {
  isLoading.value = true
  
  try {
    // Validation côté client (optionnelle)
    if (!userData.email || !userData.nom) {
      throw new Error('Données manquantes')
    }
    
    // Appel API
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(userData)
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création')
    }
    
    const newUser = await response.json()
    
    // Succès
    showNotification('Utilisateur créé avec succès', 'success')
    
    // Redirection ou mise à jour de la liste
    router.push('/users')
    
  } catch (error) {
    console.error('Erreur:', error)
    showNotification(error.message || 'Erreur lors de la création', 'error')
  } finally {
    isLoading.value = false
  }
}

function showNotification(message: string, type: 'success' | 'error') {
  // Votre système de notification
  console.log(`${type}: ${message}`)
}

function getToken() {
  // Récupération du token d'authentification
  return localStorage.getItem('token')
}
</script>
```

## 🚀 Bonnes pratiques

### 1. Utilisez les configurations prédéfinies
```typescript
// ✅ Bon - Utilise une configuration existante
<DynamicForm :config="formConfigs.createUser" />

// ❌ Évitez - Recréez une configuration similaire
const customConfig = { /* configuration similaire */ }
```

### 2. Gérez les erreurs API
```typescript
// ✅ Bon - Gestion d'erreurs complète
async function handleSubmit(data) {
  try {
    await api.create(data)
    showSuccess('Créé avec succès')
  } catch (error) {
    showError(error.message)
  }
}
```

### 3. Utilisez les données initiales pour l'édition
```typescript
// ✅ Bon - Pré-remplir les champs
<DynamicForm 
  :config="formConfigs.editUser"
  :initial-data="userToEdit"
/>
```

### 4. Validez côté client ET serveur
```typescript
// ✅ Bon - Double validation
const config = {
  fields: [
    {
      name: 'email',
      validation: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' // Client
      }
    }
  ]
}

// Côté serveur aussi
async function createUser(data) {
  // Validation serveur
  if (!isValidEmail(data.email)) {
    throw new Error('Email invalide')
  }
}
```

## 🔍 Dépannage

### Problème : Le formulaire ne s'affiche pas
**Solution :** Vérifiez que vous avez bien importé le composant et la configuration
```vue
<script setup>
import DynamicForm from '@/components/ui/DynamicForm.vue'
import { formConfigs } from '@/config/formConfigs'
</script>
```

### Problème : Les erreurs de validation ne s'affichent pas
**Solution :** Assurez-vous que la validation est configurée correctement
```typescript
{
  name: 'email',
  type: 'email',
  required: true, // Ceci déclenche la validation
  validation: {
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
  }
}
```

### Problème : Les données ne sont pas pré-remplies
**Solution :** Vérifiez que vous passez les bonnes données initiales
```vue
<DynamicForm 
  :config="formConfigs.editUser"
  :initial-data="userData" // Assurez-vous que userData contient les bonnes clés
/>
```

## 📚 Ressources supplémentaires

- **Composant DynamicForm** : `src/components/ui/DynamicForm.vue`
- **Configurations prédéfinies** : `src/config/formConfigs.ts`
- **Page de démonstration** : `src/views/dashboard/FormExampleView.vue`
- **Exemple d'intégration** : `src/views/dashboard/UsersView.vue`

## 🤝 Support

Si vous avez des questions ou besoin d'aide :
1. Consultez les exemples dans `FormExampleView.vue`
2. Regardez l'implémentation dans `UsersView.vue`
3. Vérifiez la documentation des types TypeScript
4. Testez avec les configurations prédéfinies d'abord 