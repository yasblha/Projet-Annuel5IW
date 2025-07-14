import { Injectable } from '@nestjs/common';
import { LotFacturationRepositoryAdapter } from '@infrastructure/repositories/lot-facturation.repository.adapter';
import { FactureService } from './facture.service';
import { InterServiceService } from './inter-service.service';
import { AuditService } from './audit.service';
import { MultiTenantService } from './multi-tenant.service';
import { LotFacturationStatut, LotFacturationType } from '../dtos/lot-facturation.dto';
import { CreateFactureDto } from '../dtos/create-facture.dto';
import { v4 as uuidv4 } from 'uuid';
import { LigneFactureType } from '../../domain/enums/ligne-facture-type.enum';

/**
 * Service pour la gestion des lots de facturation
 */
@Injectable()
export class LotFacturationService {
  constructor(
    private readonly repository: LotFacturationRepositoryAdapter,
    private readonly factureService: FactureService,
    private readonly interServiceService: InterServiceService,
    private readonly auditService: AuditService,
    private readonly multiTenantService: MultiTenantService,
  ) {}

  /**
   * Crée un nouveau lot de facturation
   */
  async create(dto: any, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const now = new Date();
    
    // Ajouter le tenantId et autres métadonnées
    const lotData = this.multiTenantService.addTenantToData({
      ...dto,
      id: uuidv4(),
      statut: LotFacturationStatut.EN_COURS,
      dateDebutTraitement: now,
      nbFacturesTotal: 0,
      nbFacturesTraitees: 0,
      nbFacturesErreur: 0,
      montantTotal: 0,
      createdBy: context.userId,
      updatedBy: context.userId,
      dateCreation: now,
      dateMaj: now
    }, context.tenantId);

    // Créer le lot
    const lot = await this.repository.create(lotData);
    
    // Démarrer le traitement en arrière-plan
    this.traiterLotFacturation(lot.id, context).catch(error => {
      console.error(`Erreur lors du traitement du lot ${lot.id}:`, error);
    });
    
    return lot;
  }

  /**
   * Récupère un lot par son ID
   */
  async findById(id: string, tenantId: string): Promise<any> {
    const lot = await this.repository.findById(id);
    
    if (!lot || lot.tenantId !== tenantId) {
      throw new Error('Lot de facturation non trouvé');
    }
    
    return lot;
  }

  /**
   * Récupère tous les lots de facturation
   */
  async findAll(tenantId: string): Promise<any[]> {
    const lots = await this.repository.findAll();
    
    if (!lots) {
      return [];
    }
    
    // Filtrer par tenant
    return this.multiTenantService.filterByTenant(lots, tenantId);
  }

  /**
   * Récupère les lots de facturation par période
   */
  async findByPeriod(mois: number, annee: number, tenantId: string): Promise<any[]> {
    const lots = await this.repository.findByPeriod(mois, annee);
    
    if (!lots) {
      return [];
    }
    
    // Filtrer par tenant
    return this.multiTenantService.filterByTenant(lots, tenantId);
  }

  /**
   * Traitement d'un lot de facturation
   */
  private async traiterLotFacturation(lotId: string, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      // Récupérer le lot
      const lot = await this.findById(lotId, context.tenantId);
      
      if (!lot) {
        throw new Error('Lot de facturation non trouvé');
      }
      
      // Récupérer les contrats concernés
      let contratIds = lot.contratIds || [];
      
      // Si pas de contrats spécifiés, rechercher selon les critères
      if (contratIds.length === 0 && lot.criteres) {
        try {
          const criteres = JSON.parse(lot.criteres);
          
          // Appeler le service contrat pour récupérer les contrats selon les critères
          // Dans un MVP réel, on appellerait l'API du service contrat
          // Pour l'instant, on simule avec un délai
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Simulation de récupération des contrats
          contratIds = [
            uuidv4(),
            uuidv4(),
            uuidv4()
          ];
        } catch (error) {
          throw new Error(`Erreur lors du parsing des critères: ${error.message}`);
        }
      }
      
      // Mettre à jour les stats du lot
      await this.repository.updateStats(lotId, {
        nbFacturesTotal: contratIds.length,
      });
      
      // Pour chaque contrat, générer une facture
      let nbFacturesTraitees = 0;
      let nbFacturesErreur = 0;
      let montantTotal = 0;
      
      for (const contratId of contratIds) {
        try {
          // Récupérer les informations du contrat
          const contrat = await this.interServiceService.getContratById(contratId);
          
          if (!contrat) {
            console.error(`[LotFacturationService] Contrat ${contratId} non trouvé`);
            nbFacturesErreur++;
            continue;
          }

          // Définir la période de facturation
          const periodeDebut = new Date(lot.annee, lot.mois - 1, 1);
          const periodeFin = new Date(lot.annee, lot.mois, 0);
          
          // Initialiser les lignes de facture
          const lignesFacture = [];
          
          // Récupérer les relevés de compteur pour la période
          if (contrat.compteurId) {
            const relevesCompteur = await this.interServiceService.getRelevesCompteur(contrat.compteurId, {
              dateDebut: periodeDebut,
              dateFin: periodeFin
            });
            
            // Calculer la consommation
            if (relevesCompteur && relevesCompteur.length >= 2) {
              const premier = relevesCompteur[0];
              const dernier = relevesCompteur[relevesCompteur.length - 1];
              const consommation = dernier.valeur - premier.valeur;
              
              // Récupérer les tarifs applicables
              const tarifs = await this.interServiceService.getTarifs({
                type: 'CONSOMMATION'
              });
              
              const tarifEau = tarifs.find(t => t.type === 'CONSOMMATION') || { prix: 2.5, tva: 5.5 };
              let tarifAbonnement = null;
              try {
                const tarifsAbonnement = await this.interServiceService.getTarifs({
                  type: 'ABONNEMENT'
                  // 'actif' n'est pas une propriété valide selon l'interface, nous le retirons
                });
                
                if (tarifsAbonnement && tarifsAbonnement.length > 0) {
                  tarifAbonnement = tarifsAbonnement[0]; // Prendre le premier tarif actif
                } else {
                  console.warn(`[LotFacturationService] Aucun tarif d'abonnement trouvé pour le contrat ${contratId}`);
                  // Définir un tarif par défaut
                  tarifAbonnement = {
                    prix: 10, // Prix par défaut
                    tva: 20   // TVA par défaut
                  };
                }
              } catch (error) {
                console.error(`[LotFacturationService] Erreur lors de la récupération des tarifs: ${error.message}`);
                // Définir un tarif par défaut en cas d'erreur
                tarifAbonnement = {
                  prix: 10, // Prix par défaut
                  tva: 20   // TVA par défaut
                };
              }
              
              // Ajouter la ligne de consommation
              lignesFacture.push({
                libelle: `Consommation d'eau - ${lot.mois}/${lot.annee}`,
                type: LigneFactureType.CONSOMMATION,
                quantite: consommation,
                prixUnitaire: tarifEau.prix,
                montantHT: consommation * tarifEau.prix,
                tauxTVA: tarifEau.tva,
                montantTVA: (consommation * tarifEau.prix * tarifEau.tva) / 100,
                montantTTC: consommation * tarifEau.prix * (1 + tarifEau.tva / 100),
                reference: `CONS-${lot.mois}-${lot.annee}`,
                metadata: JSON.stringify({
                  premier: premier.valeur,
                  dateDebut: premier.date,
                  dernier: dernier.valeur,
                  dateFin: dernier.date
                })
              });
              
              // Ajouter la ligne d'abonnement
              lignesFacture.push({
                libelle: `Abonnement mensuel - ${lot.mois}/${lot.annee}`,
                type: LigneFactureType.ABONNEMENT,
                quantite: 1,
                prixUnitaire: tarifAbonnement.prix,
                montantHT: tarifAbonnement.prix,
                tauxTVA: tarifAbonnement.tva,
                montantTVA: (tarifAbonnement.prix * tarifAbonnement.tva) / 100,
                montantTTC: tarifAbonnement.prix * (1 + tarifAbonnement.tva / 100),
                reference: `ABO-${lot.mois}-${lot.annee}`
              });
            }
          }
            
          // Créer la facture
          try {
            const factureDto: CreateFactureDto = {
              numero: `F${lot.annee}${lot.mois.toString().padStart(2, '0')}-${contratId.substring(0, 8)}`,
              contratId: contratId,
              clientId: contrat.proprietaireId,
              description: `Facture ${lot.mois}/${lot.annee} - ${contrat.reference || contrat.numero}`,
              periodeDebut: periodeDebut.toISOString().split('T')[0], // Conversion en string YYYY-MM-DD
              periodeFin: periodeFin.toISOString().split('T')[0], // Conversion en string YYYY-MM-DD
              dateEmission: new Date(),
              dateEcheance: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 jours
              lignes: lignesFacture,
              adresseFacturation: contrat.adresseFacturation || contrat.adresse,
              lotFacturationId: lotId
            };
            
            // Calculer les montants totaux
            let montantHT = 0;
            let montantTVA = 0;
            let montantTTC = 0;
            
            lignesFacture.forEach(ligne => {
              montantHT += ligne.montantHT;
              montantTVA += ligne.montantTVA;
              montantTTC += ligne.montantTTC;
            });
            
            factureDto.montantHT = montantHT;
            factureDto.montantTVA = montantTVA;
            factureDto.montantTTC = montantTTC;
            
            // Créer la facture
            const facture = await this.factureService.create(factureDto, context);
            
            // Mettre à jour les stats
            nbFacturesTraitees++;
            montantTotal += facture.montantTTC;
            
            // Mettre à jour les stats du lot (périodiquement)
            if (nbFacturesTraitees % 10 === 0 || nbFacturesTraitees === contratIds.length) {
              await this.repository.updateStats(lotId, {
                nbFacturesTraitees,
                nbFacturesErreur,
                montantTotal
              });
            }
          } catch (innerError) {
            console.error(`Erreur lors de la création de la facture pour le contrat ${contratId}:`, innerError);
            nbFacturesErreur++;
            
            // Mettre à jour les stats d'erreur
            await this.repository.updateStats(lotId, {
              nbFacturesTraitees,
              nbFacturesErreur,
              messageErreur: `Dernière erreur: ${innerError.message}`
            });
          }
        } catch (error) {
          console.error(`Erreur globale pour le contrat ${contratId}:`, error);
          nbFacturesErreur++;
          
          // Mettre à jour les stats d'erreur
          await this.repository.updateStats(lotId, {
            nbFacturesTraitees,
            nbFacturesErreur,
            messageErreur: `Erreur globale: ${error.message}`
          });
        }
      }
      
      // Finaliser le lot
      const dateFinTraitement = new Date();
      await this.repository.updateStatus(lotId, LotFacturationStatut.TERMINE);
      await this.repository.update(lotId, {
        dateFinTraitement,
        nbFacturesTraitees,
        nbFacturesErreur,
        montantTotal,
        updatedBy: context.userId,
        dateMaj: dateFinTraitement
      });
      
      console.log(`Lot de facturation ${lotId} traité avec succès: ${nbFacturesTraitees} factures créées, ${nbFacturesErreur} erreurs`);
    } catch (error) {
      console.error(`Erreur lors du traitement du lot de facturation ${lotId}:`, error);
      
      // Marquer le lot en erreur
      await this.repository.updateStatus(lotId, LotFacturationStatut.ERREUR);
      await this.repository.update(lotId, {
        dateFinTraitement: new Date(),
        messageErreur: error.message,
        updatedBy: context.userId,
        dateMaj: new Date()
      });
    }
  }
}
