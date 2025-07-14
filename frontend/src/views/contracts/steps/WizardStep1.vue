<template>
  <div class="step-container">
    <h2>Identité client</h2>
    
    <form @submit.prevent="handleSubmit" class="form">
      <!-- Type de propriétaire -->
      <div class="form-group">
        <label for="typeProprietaire">Type de propriétaire *</label>
        <select 
          v-model="form.typeProprietaire"
          @change="handleTypeChange"
          :class="{ 'error': errors.typeProprietaire }"
          required
        >
          <option value="">Sélectionner...</option>
          <option value="UTILISATEUR">Utilisateur</option>
          <option value="ENTREPRISE">Entreprise</option>
        </select>
        <span v-if="errors.typeProprietaire" class="error-message">
          {{ errors.typeProprietaire }}
        </span>
      </div>

      <!-- Recherche client -->
      <div class="form-group">
        <label for="clientSearch">Rechercher un client</label>
        <div class="search-container">
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            placeholder="Nom, email ou téléphone..."
            class="search-input"
          />
          <!-- Loader -->
          <div v-if="isLoading" class="loader small"></div>
          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="client in searchResults"
              :key="client.id"
              @click="selectClient(client)"
              class="search-result-item"
            >
              <div class="client-info">
                <strong>{{ client.nom }} {{ client.prenom }}</strong>
                <span>{{ client.email }}</span>
                <span v-if="client.telephone">{{ client.telephone }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="!isLoading && searchQuery.length > 2" class="no-results">
            Aucun client trouvé
          </div>
        </div>
      </div>

      <!-- Formulaire client -->
      <div v-if="!selectedClient" class="client-form">
        <div class="form-row">
          <div class="form-group">
            <label for="nom">Nom *</label>
            <input
              v-model="form.nom"
              type="text"
              :class="{ 'error': errors.nom }"
              required
            />
            <span v-if="errors.nom" class="error-message">{{ errors.nom }}</span>
          </div>
          
          <div class="form-group">
            <label for="prenom">Prénom *</label>
            <input
              v-model="form.prenom"
              type="text"
              :class="{ 'error': errors.prenom }"
              required
            />
            <span v-if="errors.prenom" class="error-message">{{ errors.prenom }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email">Email *</label>
            <input
              v-model="form.email"
              type="email"
              :class="{ 'error': errors.email }"
              required
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
          
          <div class="form-group">
            <label for="telephone">Téléphone</label>
            <input
              v-model="form.telephone"
              type="tel"
              :class="{ 'error': errors.telephone }"
            />
            <span v-if="errors.telephone" class="error-message">{{ errors.telephone }}</span>
          </div>
        </div>
      </div>

      <!-- Client sélectionné -->
      <div v-else class="selected-client">
        <div class="client-card">
          <h3>{{ selectedClient.nom }} {{ selectedClient.prenom }}</h3>
          <p>{{ selectedClient.email }}</p>
          <p v-if="selectedClient.telephone">{{ selectedClient.telephone }}</p>
          <button type="button" @click="clearSelection" class="btn btn-secondary">
            Changer de client
          </button>
        </div>
      </div>
    </form>

    <!-- Actions -->
    <div class="step-actions">
      <button type="button" @click="$emit('previous')" class="btn btn-secondary">
        Précédent
      </button>
      <button 
        type="submit" 
        @click="handleSubmit"
        :disabled="!isValid || isLoading"
        class="btn btn-primary"
      >
        {{ isLoading ? 'Chargement...' : 'Suivant' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from 'zod'
import { debounce } from '@/utils/debounce'
import { useClientStore } from '@/stores/client.store'

// Props & Emits
const props = defineProps<{
  formData: any
}>()

const emit = defineEmits<{
  'update:formData': [data: any]
  'next': []
  'previous': []
}>()

// Store clients
const clientStore = useClientStore()

// Reactive state
const form = ref({
  typeProprietaire: '',
  proprietaireId: '',
  nom: '',
  prenom: '',
  email: '',
  telephone: ''
})

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedClient = ref<any>(null)
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

// Validation schema
const ClientIdentitySchema = z.object({
  typeProprietaire: z.enum(['UTILISATEUR', 'ENTREPRISE']),
  proprietaireId: z.string().optional(),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional()
})

// Computed
const isValid = computed(() => {
  try {
    ClientIdentitySchema.parse(form.value)
    return true
  } catch {
    return false
  }
})

// Debounced search utilisant le store clients
const debouncedSearch = debounce(async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  isLoading.value = true
  try {
    await clientStore.listClients({ search: searchQuery.value, limit: 10 })
    searchResults.value = clientStore.clients
  } catch (error) {
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}, 300)

// Methods
const handleTypeChange = () => {
  // Réinitialiser la sélection quand le type change
  selectedClient.value = null
  form.value.proprietaireId = ''
  form.value.nom = ''
  form.value.prenom = ''
  form.value.email = ''
  form.value.telephone = ''
}

const selectClient = (client: any) => {
  selectedClient.value = client
  form.value.proprietaireId = client.id
  form.value.nom = client.nom
  form.value.prenom = client.prenom
  form.value.email = client.email
  form.value.telephone = client.telephone || ''
  
  searchResults.value = []
  searchQuery.value = ''
}

const clearSelection = () => {
  selectedClient.value = null
  form.value.proprietaireId = ''
  form.value.nom = ''
  form.value.prenom = ''
  form.value.email = ''
  form.value.telephone = ''
}

const validateForm = () => {
  try {
    ClientIdentitySchema.parse(form.value)
    errors.value = {}
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = {}
      error.errors.forEach(err => {
        if (err.path[0]) {
          errors.value[err.path[0] as string] = err.message
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
    // Sauvegarder les données
    emit('update:formData', { clientIdentity: form.value })
    emit('next')
  } catch (error) {
    console.error('Erreur soumission:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for form data changes
watch(() => props.formData?.clientIdentity, (newData) => {
  if (newData) {
    form.value = { ...form.value, ...newData }
  }
}, { immediate: true })
</script>

<style scoped>
.step-container {
  max-width: 800px;
  margin: 0 auto;
}

.form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input.error, select.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

.search-container {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.search-result-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.search-result-item:hover {
  background: #f8f9fa;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.client-info span {
  font-size: 12px;
  color: #666;
}

.selected-client {
  margin: 20px 0;
}

.client-card {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f9fa;
}

.client-card h3 {
  margin: 0 0 10px 0;
}

.client-card p {
  margin: 5px 0;
  color: #666;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loader.small {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin-left: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>