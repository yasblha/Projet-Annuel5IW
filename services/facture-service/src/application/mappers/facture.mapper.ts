/**
 * Mapper pour transformer les entités Facture en DTOs et vice-versa
 */
export class FactureMapper {
  /**
   * Transforme une entité Facture en DTO de réponse
   */
  static toResponse(facture: any) {
    if (!facture) return null;
    
    // Formatter les montants avec 2 décimales
    const formatMontant = (montant: number) => 
      montant !== undefined && montant !== null 
        ? parseFloat(montant.toFixed(2)) 
        : null;
    
    const result = {
      id: facture.id,
      numero: facture.numero,
      contratId: facture.contratId,
      clientId: facture.clientId,
      description: facture.description,
      statut: facture.statut,
      dateEmission: facture.dateEmission,
      dateEcheance: facture.dateEcheance,
      montantHT: formatMontant(facture.montantHT),
      montantTVA: formatMontant(facture.montantTVA),
      montantTTC: formatMontant(facture.montantTTC),
      periodeDebut: facture.periodeDebut,
      periodeFin: facture.periodeFin,
      commentaire: facture.commentaire,
      adresseFacturation: facture.adresseFacturation,
      dateCreation: facture.dateCreation,
      dateMaj: facture.dateMaj,
      createdBy: facture.createdBy,
      updatedBy: facture.updatedBy,
      tenantId: facture.tenantId,
      lignes: [],
      paiements: [],
      solde: 0
    };
    
    // Ajouter les lignes de facture si disponibles
    if (facture.lignes && Array.isArray(facture.lignes)) {
      result.lignes = facture.lignes.map(ligne => ({
        id: ligne.id,
        factureId: ligne.factureId,
        libelle: ligne.libelle,
        type: ligne.type,
        quantite: ligne.quantite,
        prixUnitaire: formatMontant(ligne.prixUnitaire),
        montantHT: formatMontant(ligne.montantHT),
        tauxTVA: ligne.tauxTVA,
        montantTVA: formatMontant(ligne.montantTVA),
        montantTTC: formatMontant(ligne.montantTTC),
        ordre: ligne.ordre,
        reference: ligne.reference,
        details: ligne.details
      })).sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    }
    
    // Ajouter les paiements si disponibles
    if (facture.paiements && Array.isArray(facture.paiements)) {
      result.paiements = facture.paiements.map(paiement => ({
        id: paiement.id,
        factureId: paiement.factureId,
        clientId: paiement.clientId,
        montant: formatMontant(paiement.montant),
        typePaiement: paiement.typePaiement,
        reference: paiement.reference,
        dateOperation: paiement.dateOperation,
        statut: paiement.statut,
        details: paiement.details,
        dateCreation: paiement.dateCreation,
        dateMaj: paiement.dateMaj
      }));
    }
    
    // Calculer le solde (montant TTC - total des paiements validés)
    const totalPaiements = result.paiements
      .filter(p => p.statut === 'VALIDE')
      .reduce((sum, p) => sum + (p.montant || 0), 0);
    
    result.solde = formatMontant((result.montantTTC || 0) - totalPaiements);
    
    return result;
  }
  
  /**
   * Transforme plusieurs entités Facture en DTOs de réponse
   */
  static toResponseList(factures: any[]) {
    if (!factures) return [];
    return factures.map(facture => this.toResponse(facture));
  }
}
