<template>
  <div class="wizard-container">
    <!-- Progress Bar -->
    <div class="progress-bar">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        :class="['step', { active: currentStep === index, completed: currentStep > index }]"
        @click="goToStep(index)"
      >
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-title">{{ step.title }}</span>
      </div>
    </div>

    <!-- Dynamic Step Component -->
    <div class="step-content">
      <Suspense>
        <template #default>
          <component 
            :is="currentStepComponent" 
            v-model:form-data="formData"
            @next="nextStep"
            @previous="previousStep"
            @save-draft="saveDraft"
          />
        </template>
        <template #fallback>
          <div class="loading-step">
            <div class="spinner"></div>
            <p>Chargement de l'étape...</p>
          </div>
        </template>
      </Suspense>
    </div>

    <!-- Navigation -->
    <div class="wizard-navigation">
      <button 
        v-if="currentStep > 0" 
        @click="previousStep"
        class="btn btn-secondary"
      >
        Précédent
      </button>
      <button 
        v-if="currentStep < steps.length - 1" 
        @click="nextStep"
        :disabled="!canProceed"
        class="btn btn-primary"
      >
        Suivant
      </button>
      <button 
        v-if="currentStep === steps.length - 1" 
        @click="finalizeContract"
        :disabled="!canFinalize"
        class="btn btn-success"
      >
        Finaliser le contrat
      </button>
      <button 
        @click="cancelWizard"
        class="btn btn-outline"
      >
        Annuler
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'

// Props & Emits
const props = defineProps<{
  formData: any
}>()

const emit = defineEmits<{
  'update:formData': [data: any]
  'next': []
  'previous': []
  'completed': [contrat: any]
  'cancelled': []
}>()

// Reactive state
const currentStep = ref(0)
const formData = ref({})
const isLoading = ref(false)

// Steps configuration with lazy loading
const steps = [
  { 
    title: 'Identité client',
    component: () => import('./steps/WizardStep1.vue'),
    validation: 'clientIdentity'
  },
  { 
    title: 'Éligibilité & adresse',
    component: () => import('./steps/WizardStep2.vue'),
    validation: 'eligibility'
  },
  { 
    title: 'Visite terrain',
    component: () => import('./steps/WizardStep3.vue'),
    validation: 'meterScan'
  },
  { 
    title: 'Offre & devis',
    component: () => import('./steps/WizardStep4.vue'),
    validation: 'quote'
  },
  { 
    title: 'Cosignataires',
    component: () => import('./steps/WizardStep5.vue'),
    validation: 'cosigners'
  },
  { 
    title: 'Suivi signatures',
    component: () => import('./steps/WizardStep6.vue'),
    validation: 'signatures'
  }
]

// Computed
const currentStepComponent = computed(() =>
  defineAsyncComponent(steps[currentStep.value].component)
)
const canProceed = computed(() => true) // Simplifié pour l'instant
const canFinalize = computed(() => currentStep.value === steps.length - 1)

// Methods
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const goToStep = (stepIndex: number) => {
  if (stepIndex <= currentStep.value) {
    currentStep.value = stepIndex
  }
}

const saveDraft = async () => {
  try {
    console.log('Brouillon sauvegardé')
  } catch (error) {
    console.error('Erreur sauvegarde brouillon:', error)
  }
}

const finalizeContract = async () => {
  isLoading.value = true
  try {
    // Simulation finalisation
    await new Promise(resolve => setTimeout(resolve, 2000))
    const contrat = {
      id: 'contrat-' + Date.now(),
      numero: 'C-P-TLS-25-001',
      statut: 'ACTIF',
      dateCreation: new Date().toISOString()
    }
    emit('completed', contrat)
  } catch (error) {
    console.error('Erreur finalisation:', error)
  } finally {
    isLoading.value = false
  }
}

const cancelWizard = () => {
  emit('cancelled')
}
</script>

<style scoped>
.wizard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.step.active {
  color: #007bff;
  font-weight: bold;
}

.step.completed {
  color: #28a745;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.step.active .step-number {
  background: #007bff;
  color: white;
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-content {
  min-height: 400px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.wizard-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 