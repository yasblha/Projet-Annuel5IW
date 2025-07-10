import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { z } from 'zod'
import { contractApi } from '@/services/api/contract.service'
import { meterApi } from '@/services/api/meter.service'
import { useWebSocket } from '@/composables/use-websocket'
import { useUserStore } from './user.store'

// Zod schemas for validation
const ClientIdentitySchema = z.object({
  proprietaireId: z.string().uuid(),
  typeProprietaire: z.enum(['UTILISATEUR', 'ENTREPRISE']),
  email: z.string().email(),
  telephone: z.string().optional(),
  nom: z.string().min(2),
  prenom: z.string().min(2)
})

const EligibilitySchema = z.object({
  zone: z.enum(['TLS', 'PAR', 'MAR', 'LYO', 'NAN', 'BOR', 'MON', 'NIC', 'STR', 'LIL']),
  typeContrat: z.enum(['I', 'P', 'C', 'A']),
  adresse: z.object({
    rue: z.string().min(5),
    codePostal: z.string().regex(/^\d{5}$/),
    ville: z.string().min(2),
    pays: z.string().default('France')
  }),
  dateDebut: z.string().datetime()
})

const MeterScanSchema = z.object({
  compteurId: z.string().uuid(),
  numeroSerie: z.string().min(7),
  calibre: z.string().regex(/^\d{2,3}$/),
  coordonnees: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional()
})

const QuoteSchema = z.object({
  montantTotal: z.number().positive(),
  devisId: z.string().uuid(),
  tarification: z.object({
    type: z.enum(['STANDARD', 'PREMIUM']),
    montantMensuel: z.number().positive()
  })
})

const CosignerSchema = z.object({
  email: z.string().email(),
  nom: z.string().min(2),
  prenom: z.string().min(2),
  telephone: z.string().optional(),
  part: z.number().min(0).max(100)
})

const SignatureSchema = z.object({
  cosignataireId: z.string().uuid(),
  statutSignature: z.enum(['EN_ATTENTE', 'SIGNE', 'REFUSE']),
  dateSignature: z.string().datetime().optional()
})

export const useContractDraftStore = defineStore('contractDraft', () => {
  // State
  const currentContract = ref<any>(null)
  const currentStep = ref(0)
  const formData = ref({
    clientIdentity: {},
    eligibility: {},
    meterScan: {},
    quote: {},
    cosigners: [],
    signatures: []
  })
  const validationErrors = ref<Record<string, string[]>>({})
  const isLoading = ref(false)
  const isDraftSaved = ref(false)

  // WebSocket connection
  const { connect, disconnect, onMessage } = useWebSocket()
  const userStore = useUserStore()

  // Computed
  const canProceedToNextStep = computed(() => (stepIndex: number) => {
    const stepValidations = {
      0: () => validateStep('clientIdentity', ClientIdentitySchema),
      1: () => validateStep('eligibility', EligibilitySchema),
      2: () => validateStep('meterScan', MeterScanSchema),
      3: () => validateStep('quote', QuoteSchema),
      4: () => validateCosigners(),
      5: () => validateSignatures()
    }
    
    return stepValidations[stepIndex]?.() ?? true
  })

  const canGoToStep = computed(() => (stepIndex: number) => {
    // Permettre de revenir en arrière ou d'aller à une étape déjà validée
    return stepIndex <= currentStep.value || isStepCompleted(stepIndex)
  })

  const canFinalizeContract = computed(() => {
    return currentContract.value?.statut === 'EN_ATTENTE' &&
           formData.value.signatures.length > 0 &&
           formData.value.signatures.every((s: any) => s.statutSignature === 'SIGNE')
  })

  const signatureProgress = computed(() => {
    if (!formData.value.signatures.length) return 0
    const signed = formData.value.signatures.filter((s: any) => s.statutSignature === 'SIGNE').length
    return Math.round((signed / formData.value.signatures.length) * 100)
  })

  // Methods
  const validateStep = (stepKey: string, schema: z.ZodSchema) => {
    try {
      schema.parse(formData.value[stepKey])
      validationErrors.value[stepKey] = []
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        validationErrors.value[stepKey] = error.errors.map(e => e.message)
      }
      return false
    }
  }

  const validateCosigners = () => {
    try {
      const cosigners = formData.value.cosigners
      if (cosigners.length === 0) return true
      
      cosigners.forEach(cosigner => CosignerSchema.parse(cosigner))
      
      // Vérifier que la somme des parts = 100%
      const totalParts = cosigners.reduce((sum, c) => sum + c.part, 0)
      if (Math.abs(totalParts - 100) > 0.01) {
        validationErrors.value.cosigners = ['La somme des parts doit être égale à 100%']
        return false
      }
      
      validationErrors.value.cosigners = []
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        validationErrors.value.cosigners = error.errors.map(e => e.message)
      }
      return false
    }
  }

  const validateSignatures = () => {
    try {
      const signatures = formData.value.signatures
      signatures.forEach(signature => SignatureSchema.parse(signature))
      validationErrors.value.signatures = []
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        validationErrors.value.signatures = error.errors.map(e => e.message)
      }
      return false
    }
  }

  const isStepCompleted = (stepIndex: number) => {
    const stepKeys = ['clientIdentity', 'eligibility', 'meterScan', 'quote', 'cosigners', 'signatures']
    const stepKey = stepKeys[stepIndex]
    return formData.value[stepKey] && Object.keys(formData.value[stepKey]).length > 0
  }

  const createDraft = async () => {
    isLoading.value = true
    try {
      const draftData = {
        ...formData.value.clientIdentity,
        ...formData.value.eligibility,
        tenantId: userStore.currentUser?.tenantId
      }
      
      const response = await contractApi.createDraft(draftData)
      currentContract.value = response.data
      isDraftSaved.value = true
      
      return response.data
    } catch (error) {
      console.error('Erreur création brouillon:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const assignMeter = async (meterData: any) => {
    if (!currentContract.value?.id) {
      throw new Error('Aucun brouillon de contrat actif')
    }
    
    try {
      const response = await contractApi.assignMeter({
        contratId: currentContract.value.id,
        compteurId: meterData.compteurId
      })
      
      formData.value.meterScan = meterData
      return response.data
    } catch (error) {
      console.error('Erreur assignation compteur:', error)
      throw error
    }
  }

  const addCosigner = async (cosignerData: any) => {
    if (!currentContract.value?.id) {
      throw new Error('Aucun brouillon de contrat actif')
    }
    
    try {
      const response = await contractApi.addCosigner(currentContract.value.id, cosignerData)
      formData.value.cosigners.push(cosignerData)
      return response.data
    } catch (error) {
      console.error('Erreur ajout cosignataire:', error)
      throw error
    }
  }

  const saveDraft = async () => {
    if (!currentContract.value?.id) {
      return await createDraft()
    }
    
    try {
      const response = await contractApi.update(currentContract.value.id, formData.value)
      currentContract.value = response.data
      isDraftSaved.value = true
      return response.data
    } catch (error) {
      console.error('Erreur sauvegarde brouillon:', error)
      throw error
    }
  }

  const finalizeContract = async () => {
    if (!currentContract.value?.id) {
      throw new Error('Aucun brouillon de contrat actif')
    }
    
    isLoading.value = true
    try {
      const response = await contractApi.finalize(currentContract.value.id)
      currentContract.value = response.data
      return response.data
    } catch (error) {
      console.error('Erreur finalisation contrat:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateSignatureStatus = (data: any) => {
    const signatureIndex = formData.value.signatures.findIndex(
      (s: any) => s.cosignataireId === data.cosignataireId
    )
    
    if (signatureIndex !== -1) {
      formData.value.signatures[signatureIndex] = data
    }
  }

  const reset = () => {
    currentContract.value = null
    currentStep.value = 0
    formData.value = {
      clientIdentity: {},
      eligibility: {},
      meterScan: {},
      quote: {},
      cosigners: [],
      signatures: []
    }
    validationErrors.value = {}
    isDraftSaved.value = false
  }

  return {
    // State
    currentContract: readonly(currentContract),
    currentStep: readonly(currentStep),
    formData: readonly(formData),
    validationErrors: readonly(validationErrors),
    isLoading: readonly(isLoading),
    isDraftSaved: readonly(isDraftSaved),
    
    // Computed
    canProceedToNextStep,
    canGoToStep,
    canFinalizeContract,
    signatureProgress,
    
    // Methods
    createDraft,
    assignMeter,
    addCosigner,
    saveDraft,
    finalizeContract,
    updateSignatureStatus,
    reset
  }
}) 