import api from './http.interceptor';

export class FactureService {
  /**
   * Récupère toutes les factures
   */
  static async getAll(params = {}) {
    return api.get(`/factures`, { params });
  }

  /**
   * Récupère une facture par son ID
   */
  static async getById(id: string) {
    return api.get(`/factures/${id}`);
  }

  /**
   * Récupère les factures d'un client
   */
  static async getByClientId(clientId: string) {
    return api.get(`/factures/client/${clientId}`);
  }

  /**
   * Récupère les factures liées à un contrat
   */
  static async getByContratId(contratId: string) {
    return api.get(`/factures/contrat/${contratId}`);
  }

  /**
   * Récupère les factures impayées
   */
  static async getUnpaidInvoices() {
    return api.get(`/factures/impayees`);
  }

  /**
   * Crée une nouvelle facture
   */
  static async create(factureData: any) {
    return api.post(`/factures`, factureData);
  }

  /**
   * Émet une facture (change son statut et envoie une notification)
   */
  static async emettre(id: string) {
    return api.put(`/factures/${id}/emettre`);
  }

  /**
   * Annule une facture
   */
  static async annuler(id: string, motifAnnulation?: string) {
    return api.put(`/factures/${id}/annuler`, { motifAnnulation });
  }

  /**
   * Enregistre un paiement pour une facture
   */
  static async enregistrerPaiement(id: string, paiementData: any) {
    return api.post(`/factures/${id}/paiements`, paiementData);
  }

  /**
   * Récupère les factures par période
   */
  static async getByPeriode(debut: string, fin: string) {
    return api.get(`/factures/periode`, {
      params: { debut, fin }
    });
  }

  /**
   * Génère un PDF pour une facture
   */
  static async generatePDF(id: string) {
    return api.get(`/factures/${id}/pdf`);
  }

  /**
   * Relance les factures impayées
   */
  static async relancerFacturesImpayees(joursDepuisEmission: number = 30) {
    return api.post(`/factures/relancer`, { joursDepuisEmission });
  }

  /**
   * Crée un lot de facturation
   */
  static async createLotFacturation(lotData: any) {
    return api.post(`/factures/lots`, lotData);
  }

  /**
   * Génère les factures pour un lot
   */
  static async generateFacturesForLot(lotId: string) {
    return api.post(`/factures/lots/${lotId}/generate`);
  }

  /**
   * Envoie une notification pour une facture
   */
  static async envoyerNotification(id: string, type: string, metaData?: Record<string, any>) {
    return api.post(`/factures/${id}/notifications`, { type, metaData });
  }
}
