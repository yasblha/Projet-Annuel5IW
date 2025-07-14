import { Injectable } from '@nestjs/common';
import { sequelize } from '@Database/sequelize';
import { ContractCounter } from '@Database/models';

@Injectable()
export class NumberGenerator {
  /**
   * Génère le numéro de contrat selon le format : C-<TYPE>-<ZONE>-<YY>-<SEQ>
   * @param params Paramètres de génération (type de contrat, zone)
   * @returns Numéro de contrat formaté (ex: C-P-TLS-25-00432)
   */
  async generateContractNumber(params: { typeContrat: string; zone: string }): Promise<string> {
    const type = params.typeContrat.charAt(0).toUpperCase(); // Utilise la première lettre du type
    const zone = params.zone.toUpperCase().substring(0, 4); // Limite à 4 caractères max
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
   * @deprecated Remplacé par generateContractNumber
   */
  async nextContractNumber(type: string, zone: string): Promise<string> {
    return this.generateContractNumber({ typeContrat: type, zone });
  }

  /**
   * @deprecated Remplacé par generateContractNumber
   */
  async nextContract(zone: string): Promise<string> {
    return this.generateContractNumber({ typeContrat: 'P', zone });
  }

  /**
   * Génère l'identifiant de compteur selon le format : M-<ZONE>-<CAL>-<SERIE>
   * @param params Paramètres du compteur (zone et autres données)
   * @returns Identifiant de compteur formaté
   */
  nextCompteurNumber(params: { zone: string; calibre?: string; serie?: string }): string {
    const zone = params.zone.toUpperCase().substring(0, 4);
    const calibre = params.calibre || '40';
    const serie = params.serie || Math.floor(Math.random() * 10000000).toString();
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