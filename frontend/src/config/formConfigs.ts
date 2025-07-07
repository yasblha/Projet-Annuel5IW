import type { FormConfig } from '@/components/ui/DynamicForm.vue'

// Configuration pour le formulaire de création d'utilisateur
export const createUserFormConfig: FormConfig = {
  title: 'Créer un nouvel utilisateur',
  description: 'Remplissez les informations pour créer un nouvel utilisateur',
  icon: 'fas fa-user-plus',
  submitText: 'Créer l\'utilisateur',
  submitIcon: 'fas fa-save',
  showReset: true,
  layout: 'grid',
  gridCols: 2,
  fields: [
    {
      name: 'nom',
      type: 'text',
      label: 'Nom',
      placeholder: 'Nom de famille',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50
      }
    },
    {
      name: 'prenom',
      type: 'text',
      label: 'Prénom',
      placeholder: 'Prénom',
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
      placeholder: 'email@exemple.com',
      required: true,
      validation: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      },
      help: 'L\'email sera utilisé pour la connexion'
    },
    {
      name: 'telephone',
      type: 'tel',
      label: 'Téléphone',
      placeholder: '01 23 45 67 89',
      validation: {
        pattern: '^(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}$'
      }
    },
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
    },
    {
      name: 'statut',
      type: 'select',
      label: 'Statut',
      required: true,
      options: [
        { value: 'ACTIF', label: 'Actif' },
        { value: 'EN_ATTENTE_VALIDATION', label: 'En attente de validation' },
        { value: 'SUSPENDU', label: 'Suspendu' }
      ]
    }
  ]
}

// Configuration pour le formulaire de modification d'utilisateur
export const editUserFormConfig: FormConfig = {
  title: 'Modifier l\'utilisateur',
  description: 'Modifiez les informations de l\'utilisateur',
  icon: 'fas fa-user-edit',
  submitText: 'Enregistrer les modifications',
  submitIcon: 'fas fa-save',
  showReset: true,
  layout: 'grid',
  gridCols: 2,
  fields: [
    {
      name: 'nom',
      type: 'text',
      label: 'Nom',
      placeholder: 'Nom de famille',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50
      }
    },
    {
      name: 'prenom',
      type: 'text',
      label: 'Prénom',
      placeholder: 'Prénom',
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
      placeholder: 'email@exemple.com',
      required: true,
      validation: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      }
    },
    {
      name: 'telephone',
      type: 'tel',
      label: 'Téléphone',
      placeholder: '01 23 45 67 89',
      validation: {
        pattern: '^(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}$'
      }
    },
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
    },
    {
      name: 'statut',
      type: 'select',
      label: 'Statut',
      required: true,
      options: [
        { value: 'ACTIF', label: 'Actif' },
        { value: 'EN_ATTENTE_VALIDATION', label: 'En attente de validation' },
        { value: 'SUSPENDU', label: 'Suspendu' }
      ]
    }
  ]
}

// Configuration pour le formulaire de création de contrat
export const createContractFormConfig: FormConfig = {
  title: 'Nouveau contrat',
  description: 'Créez un nouveau contrat pour un client',
  icon: 'fas fa-file-contract',
  submitText: 'Créer le contrat',
  submitIcon: 'fas fa-save',
  showReset: true,
  layout: 'grid',
  gridCols: 2,
  fields: [
    {
      name: 'numero',
      type: 'text',
      label: 'Numéro de contrat',
      placeholder: 'CON-2024-001',
      required: true,
      validation: {
        pattern: '^CON-\\d{4}-\\d{3}$'
      },
      help: 'Format : CON-YYYY-NNN'
    },
    {
      name: 'proprietaireId',
      type: 'text',
      label: 'ID Propriétaire',
      placeholder: 'UUID du propriétaire',
      required: true
    },
    {
      name: 'typeProprietaire',
      type: 'select',
      label: 'Type de propriétaire',
      required: true,
      options: [
        { value: 'PARTICULIER', label: 'Particulier' },
        { value: 'ENTREPRISE', label: 'Entreprise' },
        { value: 'COPROPRIETE', label: 'Copropriété' }
      ]
    },
    {
      name: 'dateDebut',
      type: 'date',
      label: 'Date de début',
      required: true
    },
    {
      name: 'dateFin',
      type: 'date',
      label: 'Date de fin',
      help: 'Optionnel pour les contrats à durée indéterminée'
    },
    {
      name: 'statut',
      type: 'select',
      label: 'Statut',
      required: true,
      options: [
        { value: 'EN_ATTENTE', label: 'En attente' },
        { value: 'ACTIF', label: 'Actif' },
        { value: 'SUSPENDU', label: 'Suspendu' }
      ]
    }
  ]
}

// Configuration pour le formulaire de création de compteur
export const createCompteurFormConfig: FormConfig = {
  title: 'Nouveau compteur',
  description: 'Ajoutez un nouveau compteur',
  icon: 'fas fa-tachometer-alt',
  submitText: 'Créer le compteur',
  submitIcon: 'fas fa-save',
  showReset: true,
  layout: 'grid',
  gridCols: 2,
  fields: [
    {
      name: 'serial',
      type: 'text',
      label: 'Numéro de série',
      placeholder: 'COMP-001',
      required: true,
      validation: {
        pattern: '^COMP-\\d{3}$'
      },
      help: 'Format : COMP-NNN'
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type de compteur',
      required: true,
      options: [
        { value: 'EAU_FROIDE', label: 'Eau froide' },
        { value: 'EAU_CHAUDE', label: 'Eau chaude' },
        { value: 'ELECTRIQUE', label: 'Électrique' }
      ]
    },
    {
      name: 'statut',
      type: 'select',
      label: 'Statut',
      required: true,
      options: [
        { value: 'ACTIF', label: 'Actif' },
        { value: 'INACTIF', label: 'Inactif' },
        { value: 'MAINTENANCE', label: 'En maintenance' }
      ]
    },
    {
      name: 'emplacement',
      type: 'text',
      label: 'Emplacement',
      placeholder: 'Cave, garage, extérieur...',
      help: 'Description de l\'emplacement du compteur'
    }
  ]
}

// Configuration pour le formulaire de création d'abonnement
export const createAbonnementFormConfig: FormConfig = {
  title: 'Nouvel abonnement',
  description: 'Créez un nouvel abonnement',
  icon: 'fas fa-calendar-plus',
  submitText: 'Créer l\'abonnement',
  submitIcon: 'fas fa-save',
  showReset: true,
  layout: 'grid',
  gridCols: 2,
  fields: [
    {
      name: 'utilisateurId',
      type: 'text',
      label: 'ID Utilisateur',
      placeholder: 'UUID de l\'utilisateur',
      required: true
    },
    {
      name: 'compteurId',
      type: 'text',
      label: 'ID Compteur',
      placeholder: 'UUID du compteur',
      required: true
    },
    {
      name: 'dateDebut',
      type: 'date',
      label: 'Date de début',
      required: true
    },
    {
      name: 'dateFin',
      type: 'date',
      label: 'Date de fin',
      help: 'Optionnel pour les abonnements à durée indéterminée'
    },
    {
      name: 'frequence',
      type: 'select',
      label: 'Fréquence',
      required: true,
      options: [
        { value: 'MENSUELLE', label: 'Mensuelle' },
        { value: 'TRIMESTRIELLE', label: 'Trimestrielle' },
        { value: 'SEMESTRIELLE', label: 'Semestrielle' },
        { value: 'ANNUELLE', label: 'Annuelle' }
      ]
    }
  ]
}

// Configuration pour le formulaire de création d'intervention
export const createInterventionFormConfig: FormConfig = {
  title: 'Nouvelle intervention',
  description: 'Planifiez une nouvelle intervention',
  icon: 'fas fa-tools',
  submitText: 'Créer l\'intervention',
  submitIcon: 'fas fa-save',
  showReset: true,
  layout: 'grid',
  gridCols: 2,
  fields: [
    {
      name: 'utilisateurId',
      type: 'text',
      label: 'ID Utilisateur',
      placeholder: 'UUID de l\'utilisateur',
      required: true
    },
    {
      name: 'compteurId',
      type: 'text',
      label: 'ID Compteur',
      placeholder: 'UUID du compteur',
      required: true
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type d\'intervention',
      required: true,
      options: [
        { value: 'INSTALLATION', label: 'Installation' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'REPARATION', label: 'Réparation' },
        { value: 'RELEVE', label: 'Relevé' },
        { value: 'DEMENAGEMENT', label: 'Déménagement' }
      ]
    },
    {
      name: 'datePlanifiee',
      type: 'datetime-local',
      label: 'Date planifiée',
      required: true
    },
    {
      name: 'technicienId',
      type: 'text',
      label: 'ID Technicien',
      placeholder: 'UUID du technicien',
      help: 'Optionnel, sera assigné automatiquement si non spécifié'
    },
    {
      name: 'priorite',
      type: 'select',
      label: 'Priorité',
      required: true,
      options: [
        { value: 'BASSE', label: 'Basse' },
        { value: 'MOYENNE', label: 'Moyenne' },
        { value: 'HAUTE', label: 'Haute' },
        { value: 'URGENTE', label: 'Urgente' }
      ]
    }
  ]
}

// Configuration pour le formulaire de création de facture
export const createFactureFormConfig: FormConfig = {
  title: 'Nouvelle facture',
  description: 'Créez une nouvelle facture',
  icon: 'fas fa-receipt',
  submitText: 'Créer la facture',
  submitIcon: 'fas fa-save',
  showReset: true,
  layout: 'grid',
  gridCols: 2,
  fields: [
    {
      name: 'numero',
      type: 'text',
      label: 'Numéro de facture',
      placeholder: 'FACT-2024-001',
      required: true,
      validation: {
        pattern: '^FACT-\\d{4}-\\d{3}$'
      },
      help: 'Format : FACT-YYYY-NNN'
    },
    {
      name: 'clientId',
      type: 'text',
      label: 'ID Client',
      placeholder: 'UUID du client',
      required: true
    },
    {
      name: 'dateEmission',
      type: 'date',
      label: 'Date d\'émission',
      required: true
    },
    {
      name: 'dateEcheance',
      type: 'date',
      label: 'Date d\'échéance',
      required: true
    },
    {
      name: 'montantHT',
      type: 'number',
      label: 'Montant HT (€)',
      placeholder: '0.00',
      required: true,
      step: '0.01',
      min: 0,
      validation: {
        min: 0
      }
    },
    {
      name: 'tauxTVA',
      type: 'number',
      label: 'Taux TVA (%)',
      placeholder: '20',
      required: true,
      step: '0.1',
      min: 0,
      max: 100,
      validation: {
        min: 0,
        max: 100
      }
    },
    {
      name: 'remise',
      type: 'number',
      label: 'Remise (€)',
      placeholder: '0.00',
      step: '0.01',
      min: 0,
      validation: {
        min: 0
      }
    },
    {
      name: 'mentionsLegales',
      type: 'textarea',
      label: 'Mentions légales',
      placeholder: 'Mentions légales obligatoires...',
      required: true,
      rows: 3,
      layout: { span: 2 }
    },
    {
      name: 'conditionsPaiement',
      type: 'textarea',
      label: 'Conditions de paiement',
      placeholder: 'Conditions de paiement...',
      rows: 2,
      layout: { span: 2 }
    }
  ]
}

// Configuration pour le formulaire de profil utilisateur
export const profileFormConfig: FormConfig = {
  title: 'Mon profil',
  description: 'Modifiez vos informations personnelles',
  icon: 'fas fa-user-cog',
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
      placeholder: 'Nom de famille',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50
      }
    },
    {
      name: 'prenom',
      type: 'text',
      label: 'Prénom',
      placeholder: 'Prénom',
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
      placeholder: 'email@exemple.com',
      required: true,
      validation: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      }
    },
    {
      name: 'telephone',
      type: 'tel',
      label: 'Téléphone',
      placeholder: '01 23 45 67 89',
      validation: {
        pattern: '^(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}$'
      }
    }
  ]
}

// Configuration pour le formulaire de changement de mot de passe
export const changePasswordFormConfig: FormConfig = {
  title: 'Changer le mot de passe',
  description: 'Sécurisez votre compte avec un nouveau mot de passe',
  icon: 'fas fa-lock',
  submitText: 'Changer le mot de passe',
  submitIcon: 'fas fa-key',
  showReset: true,
  layout: 'vertical',
  fields: [
    {
      name: 'currentPassword',
      type: 'password',
      label: 'Mot de passe actuel',
      placeholder: 'Votre mot de passe actuel',
      required: true,
      validation: {
        minLength: 6
      }
    },
    {
      name: 'newPassword',
      type: 'password',
      label: 'Nouveau mot de passe',
      placeholder: 'Nouveau mot de passe',
      required: true,
      validation: {
        minLength: 8,
        custom: (value) => {
          const hasUpperCase = /[A-Z]/.test(value)
          const hasLowerCase = /[a-z]/.test(value)
          const hasNumbers = /\d/.test(value)
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
          
          if (!hasUpperCase) return 'Le mot de passe doit contenir au moins une majuscule'
          if (!hasLowerCase) return 'Le mot de passe doit contenir au moins une minuscule'
          if (!hasNumbers) return 'Le mot de passe doit contenir au moins un chiffre'
          if (!hasSpecialChar) return 'Le mot de passe doit contenir au moins un caractère spécial'
          
          return null
        }
      },
      help: 'Minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial'
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirmer le nouveau mot de passe',
      placeholder: 'Confirmez le nouveau mot de passe',
      required: true,
      validation: {
        custom: (value) => {
          const newPassword = formData?.newPassword
          if (value !== newPassword) {
            return 'Les mots de passe ne correspondent pas'
          }
          return null
        }
      }
    }
  ]
}

// Configuration pour le formulaire de contact
export const contactFormConfig: FormConfig = {
  title: 'Nous contacter',
  description: 'Envoyez-nous un message',
  icon: 'fas fa-envelope',
  submitText: 'Envoyer le message',
  submitIcon: 'fas fa-paper-plane',
  showReset: true,
  layout: 'vertical',
  fields: [
    {
      name: 'nom',
      type: 'text',
      label: 'Nom complet',
      placeholder: 'Votre nom complet',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100
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
      name: 'sujet',
      type: 'text',
      label: 'Sujet',
      placeholder: 'Sujet de votre message',
      required: true,
      validation: {
        minLength: 5,
        maxLength: 200
      }
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      placeholder: 'Votre message...',
      required: true,
      rows: 6,
      validation: {
        minLength: 10,
        maxLength: 2000
      }
    }
  ]
}

// Export de toutes les configurations
export const formConfigs = {
  createUser: createUserFormConfig,
  editUser: editUserFormConfig,
  createContract: createContractFormConfig,
  createCompteur: createCompteurFormConfig,
  createAbonnement: createAbonnementFormConfig,
  createIntervention: createInterventionFormConfig,
  createFacture: createFactureFormConfig,
  profile: profileFormConfig,
  changePassword: changePasswordFormConfig,
  contact: contactFormConfig
} 