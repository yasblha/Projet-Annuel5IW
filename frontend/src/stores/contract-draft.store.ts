import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { z } from 'zod'
import { contractApi } from '@/services/api/contract.service'
import { meterApi } from '@/services/api/meter.service'
import { clientApi } from '@/services/api/client.service'
import { useWebSocket } from '@/composables/use-websocket'
import { useUserStore } from './user.store'
import { useAuthStore } from './auth.store'

// Zod schemas for validation
const ClientIdentitySchema = z.object({
  proprietaireId: z.string().uuid().optional(),
  typeProprietaire: z.enum(['UTILISATEUR', 'ENTREPRISE']),
  email: z.string().email(),
  telephone: z.string().optional(),
  nom: z.string().min(2),
  prenom: z.string().min(2)
})

const EligibilitySchema = z.object({
  zone: z.string().min(1),
  typeContrat: z.enum(['I', 'P', 'C', 'A']),
  adresse: z.object({
    rue: z.string().min(5),
    codePostal: z.string().regex(/^\d{5}$/),
    ville: z.string().min(2),
    pays: z.string().default('France')
  }),
  dateDebut: z.string().min(1)
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

// Devis/offre – devisId peut être n'importe quelle chaîne non vide
const QuoteSchema = z.object({
  devisId: z.string().min(3),
  montantTotal: z.number().positive(),
  tarification: z.object({
    type: z.enum(['STANDARD', 'PREMIUM']),
    montantMensuel: z.number().positive()
  })
}).passthrough()

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

// Types helpers
type StepKey = 'clientIdentity' | 'eligibility' | 'meter' | 'payment' | 'quote' | 'cosigners' | 'signatures'

interface ContractFormData {
  clientIdentity: Record<string, any>
  eligibility: Record<string, any>
  meter: Record<string, any>
  payment: Record<string, any>
  quote: Record<string, any>
  cosigners: any[]
  signatures: any[]
  [key: string]: any // fallback index signature for dynamic keys
}

// Utilitaire simple pour vérifier qu'une chaîne est un UUID v4 ou un format alphanumérique de compteur
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const counterRegex = /^[a-zA-Z0-9]{1,20}$/i
const isUuidOrCounter = (val?: string): boolean => !!val && (uuidRegex.test(val) || counterRegex.test(val))

export const useContractDraftStore = defineStore('contractDraft', () => {
  // State
  const currentContract = ref<any>(null)
  
  // Si un ancien brouillon persistant contient un id non UUID (ex: TEMP_*), on l'ignore
  if (currentContract.value && currentContract.value.id && !isUuidOrCounter(currentContract.value.id)) {
    currentContract.value = null
  }

  const currentStep = ref(0)
  const formData = ref<ContractFormData>({
    clientIdentity: {},
    eligibility: {},
    meter: {},
    payment: {},
    quote: {},
    cosigners: [],
    signatures: []
  })
  const validationErrors = ref<Record<StepKey, string[]>>({} as any)
  const isLoading = ref(false)
  const isDraftSaved = ref(false)

  // WebSocket connection
  const { connect, disconnect, onMessage } = useWebSocket()
  const authStore = useAuthStore()

  // Computed
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

  // Validation – expose comme fonction directe pour éviter l'enveloppe Ref
  const validateQuoteStep = () => {
    const q = formData.value.quote as any
    if (!q) return false
    // devisId + tarification.type suffisent pour continuer
    return typeof q.devisId === 'string' && q.devisId.length > 0 && q.tarification?.type
  }

  const canProceedToNextStep = (stepIndex: number): boolean => {
    const stepValidations: Record<number, () => boolean> = {
      0: () => validateStep('clientIdentity', ClientIdentitySchema),
      1: () => true, // Eligibilité : validation backend au brouillon
      2: () => true, // Meter step – validation léger côté backend
      3: () => true, // Payment step – simple format check; could validate later
      4: () => validateQuoteStep(),
      5: () => validateCosigners(),
      6: () => validateSignatures()
    }
    
    return stepValidations[stepIndex]?.() ?? true
  }

  // Methods
  const validateStep = (stepKey: StepKey, schema: z.ZodSchema) => {
    try {
      schema.parse((formData.value as Record<string, any>)[stepKey])
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
      const cosigners = formData.value.cosigners as any[]
      
      // Cosigners are explicitly optional - return true if empty
      if (!cosigners || cosigners.length === 0) return true
      
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
    const stepKeys = ['clientIdentity', 'eligibility', 'meter', 'payment', 'quote', 'cosigners', 'signatures']
    const stepKey = stepKeys[stepIndex]
    return formData.value[stepKey] && Object.keys(formData.value[stepKey]).length > 0
  }

  const createDraft = async () => {
    console.log('Préparation des données pour le draft...')
    
    // Récupérer le propriétaireId depuis les données du formulaire (client sélectionné)
    const clientIdentityData = formData.value.clientIdentity || {};
    const proprietaireId = clientIdentityData.proprietaireId || authStore.user?.id;
    const typeProprietaire = clientIdentityData.typeProprietaire || 'UTILISATEUR';

    // Récupérer les données de l'étape eligibility
    const eligibilityData = formData.value.eligibility || {};
    
    // Préparer les données pour la création du draft avec validation stricte
    const initialDraftData: any = {
      proprietaireId: proprietaireId,
      typeProprietaire: typeProprietaire,
      // S'assurer que zone est une chaîne alphanumérique de 2-10 caractères
      zone: typeof eligibilityData.zone === 'string' && /^[A-Za-z0-9_-]{2,10}$/.test(eligibilityData.zone) 
        ? eligibilityData.zone 
        : 'A1', // Valeur par défaut si invalide
      // S'assurer que typeContrat est l'une des valeurs autorisées
      typeContrat: ['I', 'P', 'C', 'A'].includes(eligibilityData.typeContrat) 
        ? eligibilityData.typeContrat 
        : 'I', // Individuel par défaut
      // Formater la date au format ISO 8601
      dateDebut: eligibilityData.dateDebut 
        ? new Date(eligibilityData.dateDebut).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0], // Aujourd'hui par défaut
    };
    
    // Vérifier si un compteur est spécifié
    const meter = formData.value.meter || {};
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    let compteurId = null;
    
    // Vérifier le format du compteur
    if (meter.compteurId) {
      console.log('Compteur spécifié dans le formulaire:', meter.compteurId);
      
      // Si c'est un UUID valide, l'utiliser directement
      if (uuidRegex.test(meter.compteurId)) {
        compteurId = meter.compteurId;
      } 
      // Si c'est un numéro de compteur (non-UUID), il faut le convertir en UUID via API
      else if (meter.hasMeter) {
        try {
          console.log('Conversion du numéro de compteur en ID...');
          // Appel à l'API pour récupérer le compteur par son numéro
          const meterResponse = await meterApi.scan(meter.compteurId);
          
          if (meterResponse && meterResponse.data && meterResponse.data.id) {
            compteurId = meterResponse.data.id;
            console.log('Compteur trouvé avec ID:', compteurId);
          } else {
            console.warn('Compteur non trouvé avec le numéro:', meter.compteurId);
          }
        } catch (error) {
          console.error('Erreur lors de la recherche du compteur:', error);
        }
      }
    } 
    // Générer un compteur virtuel si nécessaire
    else if (eligibilityData.adresse && !meter.hasMeter) {
      try {
        console.log('Génération d\'un compteur virtuel basé sur l\'adresse...');
        const virtualMeterResponse = await meterApi.generateVirtualMeter({
          zone: initialDraftData.zone,
          adresse: eligibilityData.adresse
        });
        
        if (virtualMeterResponse && virtualMeterResponse.data && virtualMeterResponse.data.id) {
          compteurId = virtualMeterResponse.data.id;
          console.log('Compteur virtuel généré avec succès:', virtualMeterResponse.data);
          
          // Mettre à jour les données du compteur dans le formulaire
          formData.value.meter = {
            ...formData.value.meter,
            compteurId: compteurId,
            numero: virtualMeterResponse.data.numero,
            type: virtualMeterResponse.data.type,
            statut: virtualMeterResponse.data.statut
          };
        }
      } catch (error) {
        console.error('Erreur lors de la génération du compteur virtuel:', error);
      }
    }
    
    // Ajouter le compteur au draft si disponible
    if (compteurId) {
      initialDraftData.compteurId = compteurId;
    }
    
    // N'inclure abonnementId que s'il s'agit d'un UUID valide
    const payment = formData.value.payment || {};
    if (payment.abonnementId && uuidRegex.test(payment.abonnementId)) {
      initialDraftData.abonnementId = payment.abonnementId;
    }
    
    console.log('Création du brouillon initial avec données validées:', initialDraftData);
    
    const response = await contractApi.createDraft(initialDraftData);
    const contratId = response.data.id;
    currentContract.value = response.data;
    
    // ÉTAPE 2: Mise à jour des informations complémentaires
    console.log('Mise à jour des informations complémentaires');
    
    // Données adresse et contact
    const adresse = eligibilityData.adresse;
    const contact = formData.value.contact || {};
    
    // Construire un objet de mise à jour valide selon les attentes du backend
    const updateData: any = {
      // S'assurer que l'ID est inclus et valide
      id: contratId
    };
    
    // Ajouter un objet minimal pour l'adresse
    if (adresse) {
      updateData.adresse = {
        rue: adresse.rue || adresse.ligne1 || '', // Accepter soit rue (format contrat) soit ligne1 (format client)
        complement: adresse.complement || adresse.ligne2 || '', // Accepter soit complement soit ligne2
        codePostal: adresse.codePostal || '',
        ville: adresse.ville || '',
        pays: adresse.pays || 'France'
      };
    }
    
    // Ajouter les informations de contact correctement structurées
    if (contact && (contact.email || contact.telephone)) {
      updateData.informationsContact = {
        email: contact.email || '',
        telephone: contact.telephone || ''
      };
    }
    
    // Ajouter un objet minimal si nécessaire
    if (eligibilityData.typeContrat) {
      updateData.objet = `Contrat ${eligibilityData.typeContrat === 'I' ? 'individuel' : 
                       eligibilityData.typeContrat === 'P' ? 'professionnel' : 
                       eligibilityData.typeContrat === 'C' ? 'commercial' : 'administratif'}`;
    }
    
    // N'effectuer la mise à jour que si nous avons des données à mettre à jour
    if (Object.keys(updateData).length > 0) {
      try {
        await contractApi.update(contratId, updateData);
        console.log('Informations complémentaires mises à jour avec succès');
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour des informations complémentaires:', error);
        // Ne pas bloquer le flux principal même si la mise à jour échoue
      }
    }
    
    // ÉTAPE 3: Ajout des cosignataires
    if (Array.isArray(formData.value.cosigners) && formData.value.cosigners.length > 0) {
      console.log('Ajout des cosignataires:', formData.value.cosigners.length);
      for (const cosigner of formData.value.cosigners) {
        await contractApi.addCosigner(contratId, cosigner);
      }
    }
    
    // Récupération du contrat complet mis à jour
    const updatedContract = await contractApi.getById(contratId);
    currentContract.value = updatedContract.data;
    isDraftSaved.value = true;
    
    return currentContract.value;
  }

  const linkMeter = async (meterData: any) => {
    if (!isUuidOrCounter(currentContract.value?.id)) {
      throw new Error('Aucun brouillon de contrat actif')
    }
    
    try {
      const response = await contractApi.linkMeter(currentContract.value.id, meterData.compteurId)
      
      formData.value.meter = meterData
      return response.data
    } catch (error) {
      console.error('Erreur assignation compteur:', error)
      throw error
    }
  }

  const addCosigner = async (cosignerData: any) => {
    if (!isUuidOrCounter(currentContract.value?.id)) {
      throw new Error('Aucun brouillon de contrat actif')
    }
    
    // Assurez-vous que cosigners est initialisé comme un tableau
    if (!Array.isArray(formData.value.cosigners)) {
      formData.value.cosigners = []
    }
    
    // Vérifier si les données minimales requises sont présentes
    if (!cosignerData.cosignataireId && !cosignerData.emailCosignataire) {
      console.warn('Cosignataire ignoré: ID ou email manquant')
      return null // Ne pas ajouter de cosignataire sans identifiant ou email
    }
    
    try {
      // Ajouter des valeurs par défaut pour les champs obligatoires
      const cosignerPayload = {
        ...cosignerData,
        typeCosignataire: cosignerData.typeCosignataire || 'UTILISATEUR',
        roleType: cosignerData.roleType || 'SECONDARY',
      }
      
      const response = await contractApi.addCosigner(currentContract.value.id, cosignerPayload)
      
      // Ajouter à la liste locale seulement si l'API réussit
      formData.value.cosigners.push(cosignerPayload)
      
      return response.data
    } catch (error: any) {
      console.error('Erreur ajout cosignataire:', error)
      
      // Si erreur 500 avec message spécifique sur cosignataire optionnel, continuer sans échec
      if (error?.response?.status === 500 && 
          (error?.response?.data?.message?.includes('cosignataire') || 
           error?.message?.includes('cosignataire'))) {
        console.warn('Cosignataire optionnel non ajouté, continuez le processus')
        return null
      }
      
      throw error
    }
  }

  const saveDraft = async () => {
    if (!isUuidOrCounter(currentContract.value?.id)) {
      return await createDraft()
    }
    
    try {
      // Assurer que toutes les données du formulaire sont correctement envoyées
      const payload = {
        id: currentContract.value.id,
        ...formData.value
      }
      
      // Garantir que tous les objets nécessaires sont présents et correctement structurés
      if (!payload.meter) payload.meter = {}
      if (!payload.eligibility) payload.eligibility = {}
      if (!payload.eligibility.adresse) payload.eligibility.adresse = {}
      if (!payload.quote) payload.quote = {}
      if (!payload.quote.tarification) payload.quote.tarification = { type: 'STANDARD' }
      if (!payload.clientIdentity) payload.clientIdentity = {}
      if (!payload.payment) payload.payment = {}
      if (!Array.isArray(payload.cosigners)) payload.cosigners = []
      if (!Array.isArray(payload.signatures)) payload.signatures = []
      
      // Assurez-vous que l'ID du contrat est dans le payload
      if (currentContract.value?.id) {
        payload.id = currentContract.value.id
      }
      
      const response = await contractApi.update(currentContract.value.id, payload)
      currentContract.value = response.data
      isDraftSaved.value = true
      
      // Persister dans localStorage
      localStorage.setItem('contractDraftFormData', JSON.stringify(formData.value))
      
      return response.data
    } catch (error) {
      console.error('Erreur sauvegarde brouillon:', error)
      throw error
    }
  }

  const finalizeContract = async () => {
    if (!isUuidOrCounter(currentContract.value?.id)) {
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

  const mergeFormData = (partial: Record<string, any>) => {
    // Créer une copie complète de l'état actuel
    const updatedFormData = JSON.parse(JSON.stringify(formData.value))
    
    Object.entries(partial).forEach(([key, val]) => {
      // Si le champ est un objet, on merge en profondeur
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        // Créer un nouvel objet avec les propriétés combinées
        updatedFormData[key] = {
          ...(updatedFormData[key] || {}),
          ...JSON.parse(JSON.stringify(val)) // Clonage profond pour éviter les références
        }
      } else if (Array.isArray(val)) {
        // Pour les tableaux, créer une copie complète
        updatedFormData[key] = [...val]
      } else {
        // Pour les valeurs primitives
        updatedFormData[key] = val
      }
    })
    
    // Mettre à jour l'état avec la nouvelle copie
    formData.value = updatedFormData
    
    // Persister après chaque merge
    try {
      localStorage.setItem('contractDraftFormData', JSON.stringify(formData.value))
    } catch (e) {
      console.error("Erreur lors de la sauvegarde du brouillon dans localStorage:", e)
    }
  }

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem('contractDraftFormData')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          mergeFormData(parsed)
        }
      }
    } catch {}
  }

  const loadDraft = async (id: string) => {
    isLoading.value = true
    try {
      const res = await contractApi.getById(id)
      currentContract.value = res.data

      // Tenter de reconstruire le formData à partir de la réponse
      const collected: Record<string, any> = {}
      const allowedKeys = ['clientIdentity', 'eligibility', 'meter', 'payment', 'quote', 'cosigners', 'signatures']
      allowedKeys.forEach(k => {
        if (res.data[k]) {
          collected[k] = res.data[k]
        }
      })

      // Mapper certains champs plats du contrat vers le formData attendu
      // Identité client
      if (res.data.typeProprietaire || res.data.proprietaireId) {
        collected.clientIdentity = {
          ...(collected.clientIdentity || {}),
          typeProprietaire: res.data.typeProprietaire,
          proprietaireId: res.data.proprietaireId
        }
      }

      // Éligibilité / infos générales avec adresse complète
      if (res.data.dateDebut || res.data.dateFin || res.data.zone || res.data.typeContrat || 
          (res.data.eligibility && res.data.eligibility.adresse)) {
        collected.eligibility = {
          ...(collected.eligibility || {}),
          dateDebut: res.data.dateDebut,
          dateFin: res.data.dateFin,
          zone: res.data.zone,
          typeContrat: res.data.typeContrat,
          adresse: res.data.eligibility?.adresse || {}
        }
      }
      
      // Assurer que meter est correctement mappé avec hasMeter flag
      if (res.data.meter) {
        collected.meter = {
          hasMeter: res.data.meter.hasMeter || false,
          compteurId: res.data.meter.compteurId || null
        }
      }

      // Récupérer infos détaillées du propriétaire si nécessaire
      if (res.data.proprietaireId) {
        try {
          const cliRes = await clientApi.getById(res.data.proprietaireId)
          const cli = cliRes.data || {}
          collected.clientIdentity = {
            ...(collected.clientIdentity || {}),
            nom: cli.nom,
            prenom: cli.prenom,
            email: cli.email,
            telephone: cli.telephone
          }
        } catch (e) {
          console.warn('Impossible de récupérer le client', e)
        }
      }

      if (Object.keys(collected).length) {
        mergeFormData(collected)
      }
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    currentContract.value = null
    currentStep.value = 0
    formData.value = {
      clientIdentity: {},
      eligibility: {},
      meter: {},
      payment: {},
      quote: {},
      cosigners: [],
      signatures: []
    }
    validationErrors.value = {}
    isDraftSaved.value = false
  }

  const firstIncompleteStep = (): number => {
    for (let i = 0; i < 7; i++) {
      if (!canProceedToNextStep(i)) {
        return i
      }
    }
    return 0
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
    canGoToStep,
    canFinalizeContract,
    signatureProgress,
    
    // Methods
    canProceedToNextStep,
    createDraft,
    linkMeter,
    addCosigner,
    saveDraft,
    finalizeContract,
    updateSignatureStatus,
    mergeFormData,
    loadFromStorage,
    reset,
    loadDraft,
    firstIncompleteStep
  }
}) 