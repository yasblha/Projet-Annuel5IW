import { Injectable } from '@nestjs/common';
import { sequelize } from '@Database/sequelize';
import { ContractCounter } from '@Database/models/ContractCounter.model';

@Injectable()
export class NumberGenerator {
  /**
   * Génère le numéro de contrat selon le format : C-<TYPE>-<ZONE>-<YY>-<SEQ>
   * @param type Type de contrat : 'I' (Individuel), 'P' (Particulier), 'C' (Collectivité), 'A' (Administration)
   * @param zone Code zone (ex: TLS pour Toulouse)
   * @returns Numéro de contrat formaté (ex: C-P-TLS-25-00432)
   */
  async nextContractNumber(type: string, zone: string): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    
    const nextSeq = await sequelize.transaction(async (tx) => {
      const [counter] = await ContractCounter.findOrCreate({
        where: { 
          type_code: type, 
          zone_code: zone, 
          year_short: year 
        },
        defaults: { seq: 1 },
        transaction: tx,
      });
      
      counter.seq += 1;
      await counter.save({ transaction: tx });
      return counter.seq;
    });
    
    return `C-${type}-${zone}-${year}-${String(nextSeq).padStart(5, '0')}`;
  }

  /**
   * Génère l'identifiant de compteur selon le format : M-<ZONE>-<CAL>-<SERIE>
   * @param zone Code zone (ex: TLS pour Toulouse)
   * @param calibre Calibre du compteur (ex: 40 pour 40mm)
   * @param serie Numéro de série du constructeur
   * @returns Identifiant de compteur formaté (ex: M-TLS-40-0723456)
   */
  nextCompteurNumber(zone: string, calibre: string, serie: string): string {
    const seriePadded = serie.padStart(7, '0');
    return `M-${zone}-${calibre}-${seriePadded}`;
  }

  /**
   * Valide le format d'un numéro de contrat
   * @param numero Numéro à valider
   * @returns true si le format est valide
   */
  validateContractNumber(numero: string): boolean {
    const pattern = /^C-[IPCA]-[A-Z]{3,4}-\d{2}-\d{5}$/;
    return pattern.test(numero);
  }

  /**
   * Valide le format d'un identifiant de compteur
   * @param numero Identifiant à valider
   * @returns true si le format est valide
   */
  validateCompteurNumber(numero: string): boolean {
    const pattern = /^M-[A-Z]{3,4}-\d{1,3}-\d{7}$/;
    return pattern.test(numero);
  }

  /**
   * Extrait les composants d'un numéro de contrat
   * @param numero Numéro de contrat
   * @returns Objet avec les composants extraits
   */
  parseContractNumber(numero: string): { type: string; zone: string; year: string; seq: number } | null {
    const match = numero.match(/^C-([IPCA])-([A-Z]{3,4})-(\d{2})-(\d{5})$/);
    if (!match) return null;
    
    return {
      type: match[1],
      zone: match[2],
      year: match[3],
      seq: parseInt(match[4])
    };
  }
} 