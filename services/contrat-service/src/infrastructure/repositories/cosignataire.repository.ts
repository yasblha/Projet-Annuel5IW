import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Op } from 'sequelize';

/**
 * Adaptateur Nest pour exposer le repository Cosignataire de la couche Database.
 * Permet d'ajouter facilement des règles multi-tenant ou des helpers spécifiques au service tout en
 * réutilisant l'implémentation CRUD existante.
 */
@Injectable()
export class CosignataireRepository {
  private readonly logger = new Logger(CosignataireRepository.name);
  private sequelize: any;
  private cosignataireModel: any;

  constructor(@Inject('SEQUELIZE') sequelizeProvider: any) {
    this.sequelize = sequelizeProvider;
    // Debug pour vérifier les modèles disponibles
    this.logger.debug(`Modèles disponibles: ${Object.keys(sequelizeProvider.models).join(', ')}`);
    
    // Le nom correct du modèle est ContractCosigner selon les logs
    this.cosignataireModel = sequelizeProvider.models.ContractCosigner;
    
    if (!this.cosignataireModel) {
      this.logger.error('Modèle ContractCosigner introuvable dans les modèles Sequelize');
    } else {
      this.logger.log('Modèle ContractCosigner correctement chargé');
    }
  }

  /**
   * Récupère tous les cosignataires d'un contrat
   */
  async findAllByContrat(contratId: string, tenantId?: string) {
    try {
      if (!this.cosignataireModel) {
        this.logger.error('Modèle ContractCosigner non disponible. Vérifiez l\'injection Sequelize.');
        return [];
      }
      
      const whereClause: any = { contratId };
      if (tenantId) {
        whereClause.tenantId = tenantId;
      }
      
      this.logger.debug(`Recherche des cosignataires pour le contrat ${contratId} ${tenantId ? `et tenant ${tenantId}` : ''}`);
      const results = await this.cosignataireModel.findAll({ 
        where: whereClause,
        order: [['dateCreation', 'ASC']]
      });
      
      this.logger.log(`Trouvé ${results.length} cosignataires pour le contrat ${contratId}`);
      return results;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des cosignataires du contrat ${contratId}: ${error.message}`, error.stack);
      return [];
    }
  }

  async findByContratId(contratId: string, tenantId: string) {
    return this.findAllByContrat(contratId, tenantId);
  }

  async findById(id: string) {
    if (!this.cosignataireModel) {
      this.logger.error('Modèle ContractCosigner non disponible');
      return null;
    }
    return this.cosignataireModel.findByPk(id);
  }

  async create(data: any) {
    if (!this.cosignataireModel) {
      this.logger.error('Modèle ContractCosigner non disponible');
      throw new Error('Modèle ContractCosigner non disponible');
    }
    return this.cosignataireModel.create({
      ...data,
      dateCreation: new Date()
    });
  }

  async update(id: string, data: any) {
    const cosignataire = await this.findById(id);
    if (!cosignataire) {
      throw new Error(`Cosignataire ${id} non trouvé`);
    }
    return cosignataire.update(data);
  }
  
  /**
   * Vérifie si tous les cosignataires d'un contrat ont signé
   * @param contratId Identifiant du contrat
   * @param options Options Sequelize (transaction, etc.)
   * @returns true si tous les cosignataires ont signé, false sinon
   */
  async allCosignatairesSigned(contratId: string, options?: any): Promise<boolean> {
    try {
      if (!this.cosignataireModel) {
        this.logger.error('Modèle ContractCosigner non disponible');
        return false;
      }
      
      // Compter le nombre total de cosignataires pour ce contrat
      const totalCount = await this.cosignataireModel.count({
        where: { contratId },
        ...options
      });
      
      this.logger.log(`Total de ${totalCount} cosignataires pour le contrat ${contratId}`);
      
      // Si aucun cosignataire, on considère que c'est signé
      if (totalCount === 0) {
        return true;
      }
      
      // Compter le nombre de cosignataires qui ont signé
      const signedCount = await this.cosignataireModel.count({
        where: { 
          contratId,
          signature: { [Op.not]: null },
          dateSignature: { [Op.not]: null }
        },
        ...options
      });
      
      this.logger.log(`${signedCount}/${totalCount} cosignataires ont signé pour le contrat ${contratId}`);
      
      // Tous les cosignataires ont signé si les nombres correspondent
      return signedCount === totalCount;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification des signatures des cosignataires pour le contrat ${contratId}: ${error.message}`, error.stack);
      return false;
    }
  }
}
