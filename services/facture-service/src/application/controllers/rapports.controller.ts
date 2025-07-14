import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../infrastructure/guards/tenant.guard';
import { FactureService } from '../services/facture.service';
import { Request } from 'express';

@Controller('rapports')
@UseGuards(JwtAuthGuard, TenantGuard)
export class RapportsController {
  constructor(private readonly factureService: FactureService) {}

  /**
   * Obtient les statistiques de revenus par période
   * @GET /rapports/revenus
   */
  @Get('revenus')
  async getRapportRevenus(
    @Query('debut') debut: string,
    @Query('fin') fin: string,
    @Query('groupBy') groupBy: 'jour' | 'semaine' | 'mois' | 'annee' = 'mois',
    @Req() request: Request
  ) {
    const tenantId = request['tenantId'];
    
    // Validation des dates
    if (!debut || !fin) {
      return { error: 'Les dates de début et de fin sont requises' };
    }

    try {
      const debutDate = new Date(debut);
      const finDate = new Date(fin);

      // Récupération des factures pour la période
      const factures = await this.factureService.findByPeriode(debutDate, finDate, tenantId);

      // Calcul des statistiques
      const revenus = this.calculerStatistiquesRevenus(factures, groupBy);
      
      return {
        periode: { debut: debutDate, fin: finDate },
        groupBy,
        statistiques: revenus
      };
    } catch (error) {
      return { error: 'Erreur lors de la génération du rapport de revenus', details: error.message };
    }
  }

  /**
   * Obtient les statistiques de taux de recouvrement par période
   * @GET /rapports/recouvrement
   */
  @Get('recouvrement')
  async getRapportRecouvrement(
    @Query('debut') debut: string,
    @Query('fin') fin: string,
    @Req() request: Request
  ) {
    const tenantId = request['tenantId'];
    
    // Validation des dates
    if (!debut || !fin) {
      return { error: 'Les dates de début et de fin sont requises' };
    }

    try {
      const debutDate = new Date(debut);
      const finDate = new Date(fin);

      // Récupération des factures pour la période
      const factures = await this.factureService.findByPeriode(debutDate, finDate, tenantId);

      // Calcul du taux de recouvrement
      const totalFacture = factures.reduce((sum, facture) => sum + facture.montantTTC, 0);
      const totalPaye = factures.reduce((sum, facture) => {
        // Somme des paiements pour chaque facture
        const paiements = facture.paiements || [];
        return sum + paiements.reduce((pSum, paiement) => pSum + paiement.montant, 0);
      }, 0);

      const tauxRecouvrement = totalFacture > 0 ? (totalPaye / totalFacture) * 100 : 0;
      
      return {
        periode: { debut: debutDate, fin: finDate },
        totalFacture,
        totalPaye,
        tauxRecouvrement: parseFloat(tauxRecouvrement.toFixed(2)),
        factures: factures.length
      };
    } catch (error) {
      return { error: 'Erreur lors de la génération du rapport de recouvrement', details: error.message };
    }
  }

  /**
   * Obtient les statistiques de factures impayées avec âge (aging)
   * @GET /rapports/aging
   */
  @Get('aging')
  async getRapportAging(@Req() request: Request) {
    const tenantId = request['tenantId'];

    try {
      // Récupération des factures impayées
      const factures = await this.factureService.findUnpaid(tenantId);
      
      const aujourdhui = new Date();
      
      // Calculer l'âge de chaque facture impayée
      const aging = {
        total: 0,
        '0-30': { count: 0, montant: 0 },
        '31-60': { count: 0, montant: 0 },
        '61-90': { count: 0, montant: 0 },
        '91+': { count: 0, montant: 0 }
      };
      
      factures.forEach(facture => {
        const dateEmission = new Date(facture.dateEmission);
        const differenceJours = Math.floor((aujourdhui.getTime() - dateEmission.getTime()) / (1000 * 3600 * 24));
        
        aging.total += facture.montantTTC;
        
        if (differenceJours <= 30) {
          aging['0-30'].count++;
          aging['0-30'].montant += facture.montantTTC;
        } else if (differenceJours <= 60) {
          aging['31-60'].count++;
          aging['31-60'].montant += facture.montantTTC;
        } else if (differenceJours <= 90) {
          aging['61-90'].count++;
          aging['61-90'].montant += facture.montantTTC;
        } else {
          aging['91+'].count++;
          aging['91+'].montant += facture.montantTTC;
        }
      });
      
      return {
        dateRapport: aujourdhui,
        totalFacturesImpayees: factures.length,
        montantTotalImpaye: aging.total,
        aging
      };
    } catch (error) {
      return { error: 'Erreur lors de la génération du rapport de aging', details: error.message };
    }
  }

  /**
   * Obtient les statistiques de lots de facturation
   * @GET /rapports/lots
   */
  @Get('lots')
  async getRapportLots(
    @Query('annee') annee: string,
    @Req() request: Request
  ) {
    const tenantId = request['tenantId'];
    
    try {
      // Obtenir les statistiques des lots de facturation pour l'année spécifiée
      const anneeValue = annee ? parseInt(annee) : new Date().getFullYear();
      
      // Cette méthode serait à implémenter dans le service
      return { message: "Fonctionnalité à implémenter", annee: anneeValue };
    } catch (error) {
      return { error: 'Erreur lors de la génération du rapport de lots', details: error.message };
    }
  }

  /**
   * Méthode utilitaire pour calculer les statistiques de revenus
   */
  private calculerStatistiquesRevenus(factures, groupBy) {
    // Implémentation simple par défaut - à améliorer selon les besoins spécifiques
    const stats = {};
    
    factures.forEach(facture => {
      let key;
      const dateEmission = new Date(facture.dateEmission);
      
      switch (groupBy) {
        case 'jour':
          key = dateEmission.toISOString().split('T')[0];
          break;
        case 'semaine':
          const premiereJourAnnee = new Date(dateEmission.getFullYear(), 0, 1);
          const diffTime = dateEmission.getTime() - premiereJourAnnee.getTime();
          const numeroSemaine = Math.ceil((diffTime / 86400000 + premiereJourAnnee.getDay() + 1) / 7);
          key = `${dateEmission.getFullYear()}-W${numeroSemaine}`;
          break;
        case 'mois':
          key = `${dateEmission.getFullYear()}-${String(dateEmission.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'annee':
          key = `${dateEmission.getFullYear()}`;
          break;
        default:
          key = `${dateEmission.getFullYear()}-${String(dateEmission.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!stats[key]) {
        stats[key] = { 
          count: 0, 
          montantHT: 0, 
          montantTVA: 0, 
          montantTTC: 0,
          montantPaye: 0 
        };
      }
      
      stats[key].count++;
      stats[key].montantHT += facture.montantHT || 0;
      stats[key].montantTVA += facture.montantTVA || 0;
      stats[key].montantTTC += facture.montantTTC || 0;
      
      // Calculer le montant payé
      const paiements = facture.paiements || [];
      const montantPaye = paiements.reduce((sum, p) => sum + p.montant, 0);
      stats[key].montantPaye += montantPaye;
    });
    
    return Object.keys(stats).map(key => ({ 
      periode: key, 
      ...stats[key],
      tauxRecouvrement: stats[key].montantTTC > 0 
        ? parseFloat(((stats[key].montantPaye / stats[key].montantTTC) * 100).toFixed(2)) 
        : 0
    }));
  }
}
