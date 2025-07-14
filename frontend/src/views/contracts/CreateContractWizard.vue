<template>
  <div class="wizard-container">
    <!-- Progress Bar -->
    <div class="progress-bar">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        :class="['step', { active: currentStep.value === index, completed: currentStep.value > index }]"
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
          <div>
            <component 
              :is="currentStepComponent" 
              :form-data="formData"
              @update:formData="handleUpdateFormData"
              @next="nextStep"
              @previous="previousStep"
              @save-draft="saveDraft"
              @contract-finalized="handleContractFinalized"
            />
          </div>
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
        v-if="currentStep.value > 0" 
        @click="previousStep"
        class="btn btn-secondary"
      >
        Précédent
      </button>
      <button 
        v-if="currentStep.value < steps.length - 1" 
        @click="nextStep"
        :disabled="!canProceed"
        class="btn btn-primary"
      >
        Suivant
      </button>
      <button 
        v-if="currentStep.value === steps.length - 1" 
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
import { ref, computed, shallowRef, watch, defineExpose, defineEmits, defineProps, withDefaults, onMounted } from 'vue'
import { useContractDraftStore } from '@/stores/contract-draft.store'
import { useInterventionStore } from '@/stores/intervention.store'
import WizardStep1 from './steps/WizardStep1.vue'
import WizardStep2 from './steps/WizardStep2.vue'
import WizardStepMeter from './steps/WizardStepMeter.vue'
import WizardStepPayment from './steps/WizardStepPayment.vue'
import WizardStep4 from './steps/WizardStep4.vue'
import WizardStep5 from './steps/WizardStep5.vue'
import WizardStep6 from './steps/WizardStep6.vue'

// Props (optionnel) – le parent peut ne pas fournir, par défaut {}
const props = withDefaults(defineProps<{
  formData?: any
}>(), {
  formData: () => ({})
})

// Events émis vers le parent (formData update facultatif)
const emit = defineEmits<{
  'update:formData'?: [data: any]
  'next'?: []
  'previous'?: []
  'completed': [contrat: any]
  'cancelled'?: []
}>()

// Store brouillon de contrat (workflow backend)
const draftStore = useContractDraftStore()

// ID du brouillon courant (réactif)
const currentContractId = computed(() => draftStore.currentContract?.id || null)

// Objet partagé entre wizard et steps (déréférence le ref du store)
const formData = draftStore.formData as any // reactive object

const isLoading = computed(() => draftStore.isLoading)

// Intervention store
const interventionStore = useInterventionStore()

// Charger un éventuel formData du localStorage (remplissage brouillon hors-ligne)
onMounted(() => {
  draftStore.loadFromStorage()
})

// Reactive state
const currentStep = ref(0)
const finalizedContractId = ref('')
const steps = [
  { 
    title: 'Identité client',
    component: WizardStep1,
    validation: 'clientIdentity'
  },
  { 
    title: 'Éligibilité & adresse',
    component: WizardStep2,
    validation: 'eligibility'
  },
  { 
    title: 'Compteur',
    component: WizardStepMeter,
    validation: 'meter'
  },
  { 
    title: 'Paiement',
    component: WizardStepPayment,
    validation: 'payment'
  },
  { 
    title: 'Offre & devis',
    component: WizardStep4,
    validation: 'quote'
  },
  { 
    title: 'Cosignataires',
    component: WizardStep5,
    validation: 'cosigners'
  },
  { 
    title: 'Suivi signatures',
    component: WizardStep6,
    validation: 'signatures'
  }
]

// Computed
const currentStepComponent = computed(() =>
  steps[currentStep.value].component
)

// Validation flags
const canProceed = computed(() => draftStore.canProceedToNextStep(currentStep.value))
const canFinalize = computed(() => draftStore.canFinalizeContract)

// Methods
const nextStep = async () => {
  // Toujours exécuter la logique métier de l'étape courante en premier
  await handleStepBusinessLogic(currentStep.value)

  // Recalculer la possibilité d'avancer après la persistance des données
  const canGoNext = draftStore.canProceedToNextStep(currentStep.value)

  if (currentStep.value < steps.length - 1 && canGoNext) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// Permet au parent (ContratsView) de naviguer librement (reprise de brouillon)
const goToStep = (stepIndex: number) => {
  currentStep.value = Math.min(Math.max(stepIndex, 0), steps.length - 1)
}

// Expose la méthode au parent via ref
defineExpose({ goToStep })

const saveDraft = async () => {
  try {
    await draftStore.saveDraft()
    console.log('Brouillon sauvegardé')
  } catch (error) {
    console.error('Erreur sauvegarde brouillon:', error)
  }
}

const finalizeContract = async () => {
  try {
    await handleStepBusinessLogic(currentStep.value)
    const finalized = await draftStore.finalizeContract()
    emit('completed', finalized)
  } catch (error) {
    console.error('Erreur finalisation:', error)
  }
}

const cancelWizard = () => {
  emit('cancelled')
}

// Centralise la logique backend liée à une étape
const handleStepBusinessLogic = async (stepIdx: number) => {
  switch (stepIdx) {
    case 1: // Eligibility – créer brouillon si pas encore
      if (!currentContractId.value) {
        await draftStore.createDraft()
      } else {
        await draftStore.saveDraft()
      }
      break
    case 2: // Meter step
      const meter = formData.meter as any
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (meter?.hasMeter && uuidRegex.test(meter.compteurId || '')) {
        await draftStore.linkMeter({ compteurId: meter.compteurId })
      } 
      // Note: Nous avons supprimé la création d'intervention ici
      // Elle sera gérée uniquement côté backend lors de la finalisation
      break
    case 3: // Payment – nop, just save form
      await draftStore.saveDraft()
      break
    case 4: // Quote – sauvegarder brouillon
      await draftStore.saveDraft()
      break
    case 5: // Cosigners – ajouter cosignataires
      const cosigners: any[] = formData.cosigners as any[]
      if (cosigners?.length) {
        for (const cos of cosigners) {
          await draftStore.addCosigner({
            ...cos,
            typeCosignataire: 'ENTREPRISE', // TODO: mapper en fonction du choix réel
            roleType: 'SECONDARY'
          })
        }
      }
      break
    case 6: // Signature step – nothing special yet
      break
    default:
      // Pour les autres étapes, juste sauvegarder
      if (currentContractId.value) {
        await draftStore.saveDraft()
      }
  }
}

// Gère la mise à jour émise par les composants d'étape
const handleUpdateFormData = (data: any) => {
  draftStore.mergeFormData(data)
}

const handleContractFinalized = (contractId: string) => {
  // Enregistrer l'ID du contrat finalisé
  finalizedContractId.value = contractId
  // On pourrait aussi ajouter des actions supplémentaires ici, comme envoyer une notification
  console.log(`Contrat finalisé avec succès: ${contractId}`)
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