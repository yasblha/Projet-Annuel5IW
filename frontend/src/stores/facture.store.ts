import { defineStore } from 'pinia';
import { FactureService } from '@/services/facture.service';
import { useNotificationStore } from './notification.store';

interface FactureState {
  factures: any[];
  facturesCourantes: any[];
  facturesImpayees: any[];
  factureActive: any | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  totalPages: number;
  currentPage: number;
}

export const useFactureStore = defineStore('facture', {
  state: (): FactureState => ({
    factures: [],
    facturesCourantes: [],
    facturesImpayees: [],
    factureActive: null,
    loading: false,
    error: null,
    success: null,
    totalPages: 0,
    currentPage: 1
  }),

  actions: {
    // Réinitialiser les messages
    resetMessages() {
      this.error = null;
      this.success = null;
    },

    // Récupérer toutes les factures
    async fetchFactures() {
      this.resetMessages();
      this.loading = true;
      try {
        const response = await FactureService.getAll();
        this.factures = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de la récupération des factures';
        console.error('Erreur lors de la récupération des factures:', error);
      } finally {
        this.loading = false;
      }
    },

    // Récupérer une facture par ID
    async fetchFacture(id: string) {
      this.resetMessages();
      this.loading = true;
      try {
        const response = await FactureService.getById(id);
        this.factureActive = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de la récupération de la facture';
        console.error('Erreur lors de la récupération de la facture:', error);
      } finally {
        this.loading = false;
      }
    },

    // Récupérer les factures d'un client
    async fetchFacturesClient(clientId: string) {
      this.resetMessages();
      this.loading = true;
      try {
        const response = await FactureService.getByClientId(clientId);
        this.factures = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de la récupération des factures du client';
        console.error('Erreur lors de la récupération des factures du client:', error);
      } finally {
        this.loading = false;
      }
    },

    // Récupérer les factures d'un contrat
    async fetchFacturesContrat(contratId: string) {
      this.resetMessages();
      this.loading = true;
      try {
        const response = await FactureService.getByContratId(contratId);
        this.facturesCourantes = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de la récupération des factures du contrat';
        console.error('Erreur lors de la récupération des factures du contrat:', error);
      } finally {
        this.loading = false;
      }
    },

    // Récupérer les factures impayées
    async fetchFacturesImpayees() {
      this.resetMessages();
      this.loading = true;
      try {
        const response = await FactureService.getUnpaidInvoices();
        this.facturesImpayees = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de la récupération des factures impayées';
        console.error('Erreur lors de la récupération des factures impayées:', error);
      } finally {
        this.loading = false;
      }
    },

    // Créer une nouvelle facture
    async createFacture(factureData: any) {
      this.resetMessages();
      this.loading = true;
      try {
        const response = await FactureService.create(factureData);
        this.success = 'Facture créée avec succès';
        // Ajouter la nouvelle facture à la liste
        this.factures = [response.data, ...this.factures];
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de la création de la facture';
        console.error('Erreur lors de la création de la facture:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Émettre une facture
    async emettreFacture(id: string) {
      this.resetMessages();
      this.loading = true;
      const notificationStore = useNotificationStore();
      
      try {
        const response = await FactureService.emettre(id);
        this.success = 'Facture émise avec succès';
        
        // Mettre à jour la facture dans toutes les listes
        this.updateFactureInLists(response.data);
        
        // Afficher une notification
        notificationStore.success('La facture a été émise avec succès');
        
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'émission de la facture';
        notificationStore.error('Impossible d\'émettre la facture');
        console.error('Erreur lors de l\'émission de la facture:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Annuler une facture
    async annulerFacture(id: string, motif?: string) {
      this.resetMessages();
      this.loading = true;
      const notificationStore = useNotificationStore();
      
      try {
        const response = await FactureService.annuler(id, motif);
        this.success = 'Facture annulée avec succès';
        
        // Mettre à jour la facture dans toutes les listes
        this.updateFactureInLists(response.data);
        
        // Afficher une notification
        notificationStore.success('La facture a été annulée avec succès');
        
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'annulation de la facture';
        notificationStore.error('Impossible d\'annuler la facture');
        console.error('Erreur lors de l\'annulation de la facture:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Enregistrer un paiement
    async enregistrerPaiement(factureId: string, paiementData: any) {
      this.resetMessages();
      this.loading = true;
      const notificationStore = useNotificationStore();
      
      try {
        const response = await FactureService.enregistrerPaiement(factureId, paiementData);
        this.success = 'Paiement enregistré avec succès';
        
        // Mettre à jour la facture dans toutes les listes
        this.updateFactureInLists(response.data.facture);
        
        // Si la facture était impayée et est maintenant payée, la retirer des factures impayées
        if (response.data.facture.statut === 'PAYEE') {
          this.facturesImpayees = this.facturesImpayees.filter(f => f.id !== factureId);
        }
        
        // Afficher une notification
        notificationStore.success('Le paiement a été enregistré avec succès');
        
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'enregistrement du paiement';
        notificationStore.error('Impossible d\'enregistrer le paiement');
        console.error('Erreur lors de l\'enregistrement du paiement:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Générer un PDF
    async generatePDF(id: string) {
      this.resetMessages();
      this.loading = true;
      const notificationStore = useNotificationStore();
      
      try {
        const response = await FactureService.generatePDF(id);
        
        // Le backend renvoie l'URL ou le chemin du PDF généré
        const pdfUrl = response.data.pdfPath || response.data;
        
        // Ouvrir le PDF dans un nouvel onglet si l'URL est disponible
        if (pdfUrl) {
          window.open(pdfUrl, '_blank');
        }
        
        notificationStore.success('Le PDF a été généré avec succès');
        return pdfUrl;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de la génération du PDF';
        notificationStore.error('Impossible de générer le PDF');
        console.error('Erreur lors de la génération du PDF:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Créer un lot de facturation
    async createLotFacturation(lotData: any) {
      this.resetMessages();
      this.loading = true;
      const notificationStore = useNotificationStore();
      
      try {
        const response = await FactureService.createLotFacturation(lotData);
        this.success = 'Lot de facturation créé avec succès';
        notificationStore.success('Le lot de facturation a été créé avec succès');
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de la création du lot de facturation';
        notificationStore.error('Impossible de créer le lot de facturation');
        console.error('Erreur lors de la création du lot de facturation:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Générer les factures d'un lot
    async generateFacturesLot(lotId: string) {
      this.resetMessages();
      this.loading = true;
      const notificationStore = useNotificationStore();
      
      try {
        const response = await FactureService.generateFacturesForLot(lotId);
        this.success = 'Génération des factures terminée';
        
        // Si le service retourne les nouvelles factures, les ajouter à la liste
        if (Array.isArray(response.data)) {
          this.factures = [...response.data, ...this.factures];
        }
        
        notificationStore.success(`${response.data.length || 'Des'} factures ont été générées avec succès`);
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erreur lors de la génération des factures';
        notificationStore.error('Impossible de générer les factures');
        console.error('Erreur lors de la génération des factures:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Méthode utilitaire pour mettre à jour une facture dans toutes les listes
    updateFactureInLists(updatedFacture: any) {
      // Mettre à jour dans la liste principale
      const mainIndex = this.factures.findIndex(f => f.id === updatedFacture.id);
      if (mainIndex !== -1) {
        this.factures[mainIndex] = { ...this.factures[mainIndex], ...updatedFacture };
      }
      
      // Mettre à jour dans les factures courantes
      const currentIndex = this.facturesCourantes.findIndex(f => f.id === updatedFacture.id);
      if (currentIndex !== -1) {
        this.facturesCourantes[currentIndex] = { ...this.facturesCourantes[currentIndex], ...updatedFacture };
      }
      
      // Mettre à jour dans les factures impayées ou la retirer si payée
      const unpaidIndex = this.facturesImpayees.findIndex(f => f.id === updatedFacture.id);
      if (unpaidIndex !== -1) {
        if (updatedFacture.statut === 'PAYEE' || updatedFacture.statut === 'ANNULEE') {
          this.facturesImpayees.splice(unpaidIndex, 1);
        } else {
          this.facturesImpayees[unpaidIndex] = { ...this.facturesImpayees[unpaidIndex], ...updatedFacture };
        }
      }
      
      // Mettre à jour la facture active si c'est celle-ci
      if (this.factureActive && this.factureActive.id === updatedFacture.id) {
        this.factureActive = { ...this.factureActive, ...updatedFacture };
      }
    }
  }
});
