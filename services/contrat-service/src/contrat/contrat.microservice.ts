import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContratQueryService } from '@application/services/contrat-query.service';
import { ContratCommandService } from '@application/services/contrat-command.service';
import { ContratService, ContratBaseDto } from '@application/services/contrat.service';
import { InterServiceService } from '@application/services/inter-service.service';
import { CompteurService } from '@application/services/compteur.service';

// DTOs
import { CreateContratDto } from '@application/dtos/create-contrat.dto';
import { UpdateContratDto } from '@application/dtos/update-contrat.dto';
import { CreateCosignataireDto, UpdateCosignataireDto } from '@application/dtos/cosignataire.dto';
import { SignatureContratDto } from '@application/dtos/signature-contrat.dto';
import { ResiliationContratDto } from '@application/dtos/resiliation-contrat.dto';
import { SuspensionContratDto } from '@application/dtos/suspension-contrat.dto';
import { RenouvellementContratDto } from '@application/dtos/renouvellement-contrat.dto';
import { LienAbonnementDto, LienCompteurDto } from '@application/dtos/lien-contrat.dto';
import { CreateContratDraftDto } from '@application/dtos/create-contrat-draft.dto';

@Controller()
export class ContratMicroservice {
  private readonly logger = new Logger(ContratMicroservice.name);

  constructor(
    private readonly queryService: ContratQueryService,
    private readonly commandService: ContratCommandService,
    private readonly contratService: ContratService,
    private readonly interServiceService: InterServiceService,
    private readonly compteurService: CompteurService,
  ) {}

  @MessagePattern('contrat.findAll')
  async findAll(@Payload() data?: { context?: any }) {
    this.logger.log(' [contrat.findAll] Requête reçue');

    try {
      // Utiliser le tenantId du contexte s'il existe, sinon ne pas filtrer par tenant
      const params: any = {};
      if (data?.context?.tenantId) {
        params.tenantId = data.context.tenantId;
      }
      
      const result = await this.queryService.findAll(params);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(` [contrat.findAll] Erreur: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern('contrat.findById')
  async findById(@Payload() data: { id: string; context?: any }) {
    this.logger.log(` [contrat.findById] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.queryService.findById(data.id, data.context);
      if (result) {
        this.logger.log(` [contrat.findById] Contrat trouvé: ${data.id}`);
      } else {
        this.logger.warn(` [contrat.findById] Contrat non trouvé: ${data.id}`);
      }
      return result;
    } catch (e) {
      this.logger.error(` [contrat.findById] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.create')
  async create(@Payload() data: CreateContratDto & { context?: any }) {
    this.logger.log(` [contrat.create] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.commandService.create(data, data.context || {});
      this.logger.log(` [contrat.create] Contrat créé: ${JSON.stringify(result)}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.create] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.createDraft')
  async createDraft(@Payload() data: { proprietaireId: string; zone: string; context?: any } & Partial<ContratBaseDto>) {
    this.logger.log(` [contrat.createDraft] Requête reçue: ${JSON.stringify(data)}`);
    try {
      // Générer un compteur virtuel si une zone est fournie
      let compteurId = null;
      if (data.zone) {
        try {
          // Récupérer l'adresse si elle est fournie
          const adresse = data.adresse || {};
          
          // Générer un compteur virtuel
          const compteur = await this.interServiceService.generateVirtualMeter({
            zone: data.zone,
            adresse: adresse,
            tenantId: data.context?.tenantId
          });
          
          if (compteur && compteur.id) {
            compteurId = compteur.id;
            this.logger.log(` [contrat.createDraft] Compteur virtuel associé: ${compteurId}`);
          }
        } catch (err) {
          this.logger.warn(` [contrat.createDraft] Impossible de générer un compteur: ${err.message}`);
          // Continuer la création du contrat sans compteur
        }
      }

      const { context, ...dtoWithoutContext } = data;
      
      // Ajouter l'ID du compteur au DTO si un compteur a été généré
      const dto = compteurId ? { ...dtoWithoutContext, compteurId } : dtoWithoutContext;
      
      const result = await this.contratService.createDraft(dto, context || {});
      this.logger.log(` [contrat.createDraft] Brouillon créé: ${JSON.stringify(result)}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.createDraft] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.update')
  async update(@Payload() data: { id: string; context?: any } & UpdateContratDto) {
    this.logger.log(` [contrat.update] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.commandService.update(id, { ...dto, id }, context || {});
      if (result) {
        this.logger.log(` [contrat.update] Contrat mis à jour: ${id}`);
      } else {
        this.logger.warn(` [contrat.update] Contrat non trouvé: ${id}`);
      }
      return result;
    } catch (e) {
      this.logger.error(` [contrat.update] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.delete')
  async delete(@Payload() data: { id: string; context?: any }) {
    this.logger.log(` [contrat.delete] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.commandService.delete(data.id, data.context || {});
      if (result) {
        this.logger.log(` [contrat.delete] Contrat supprimé: ${data.id}`);
      } else {
        this.logger.warn(` [contrat.delete] Contrat non trouvé: ${data.id}`);
      }
      return result;
    } catch (e) {
      this.logger.error(` [contrat.delete] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === COSIGNATAIRES ===
  @MessagePattern('contrat.getCosignatairesByContrat')
  async getCosignatairesByContrat(@Payload() data: { contratId: string; context?: any }) {
    this.logger.log(` [contrat.getCosignatairesByContrat] Requête reçue: ${JSON.stringify(data)}`);
    try {
      // Passer l'objet context complet au lieu de simplement context?.tenantId
      const result = await this.queryService.getCosignatairesByContrat(data.contratId, data.context || {});
      this.logger.log(` [contrat.getCosignatairesByContrat] ${result.length} cosignataires trouvés`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.getCosignatairesByContrat] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.createCosignataire')
  async createCosignataire(@Payload() data: { contratId: string; context?: any } & CreateCosignataireDto) {
    this.logger.log(` [contrat.createCosignataire] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { contratId, context, ...dto } = data;
      const result = await this.commandService.createCosignataire(contratId, { ...dto, contratId }, context || {});
      this.logger.log(` [contrat.createCosignataire] Cosignataire créé`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.createCosignataire] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.updateCosignataire')
  async updateCosignataire(@Payload() data: { cosignataireId: string; context?: any } & UpdateCosignataireDto) {
    this.logger.log(` [contrat.updateCosignataire] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { cosignataireId, context, ...dto } = data;
      const result = await this.commandService.updateCosignataire(cosignataireId, dto, context || {});
      this.logger.log(` [contrat.updateCosignataire] Cosignataire mis à jour`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.updateCosignataire] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.signCosignataire')
  async signCosignataire(@Payload() data: { cosignataireId: string; context?: any }) {
    this.logger.log(` [contrat.signCosignataire] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.commandService.updateCosignataire(data.cosignataireId, {
        signatureElectronique: true,
        signatureDate: new Date(),
        statutInvitation: 'ACCEPTE',
      }, data.context || {});
      this.logger.log(` [contrat.signCosignataire] Cosignataire signé`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.signCosignataire] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === SIGNATURE ===
  @MessagePattern('contrat.signContrat')
  async signContrat(@Payload() data: { id: string; context?: any } & SignatureContratDto) {
    this.logger.log(` [contrat.signContrat] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.commandService.signContrat(id, dto, context || {});
      this.logger.log(` [contrat.signContrat] Contrat signé: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.signContrat] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === RÉSILIATION ===
  @MessagePattern('contrat.resilierContrat')
  async resilierContrat(@Payload() data: { id: string; context?: any } & ResiliationContratDto) {
    this.logger.log(` [contrat.resilierContrat] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.commandService.resilierContrat(id, dto, context || {});
      this.logger.log(` [contrat.resilierContrat] Contrat résilié: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.resilierContrat] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === SUSPENSION ===
  @MessagePattern('contrat.suspendreContrat')
  async suspendreContrat(@Payload() data: { id: string; context?: any } & SuspensionContratDto) {
    this.logger.log(` [contrat.suspendreContrat] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.commandService.suspendreContrat(id, dto, context || {});
      this.logger.log(` [contrat.suspendreContrat] Contrat suspendu: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.suspendreContrat] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === RENOUVELLEMENT ===
  @MessagePattern('contrat.renouvelerContrat')
  async renouvelerContrat(@Payload() data: { id: string; context?: any } & RenouvellementContratDto) {
    this.logger.log(` [contrat.renouvelerContrat] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.commandService.renouvelerContrat(id, dto, context || {});
      this.logger.log(` [contrat.renouvelerContrat] Contrat renouvelé: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.renouvelerContrat] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === LIENS ===
  @MessagePattern('contrat.lierAbonnement')
  async lierAbonnement(@Payload() data: { id: string; context?: any } & LienAbonnementDto) {
    this.logger.log(` [contrat.lierAbonnement] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.commandService.lierAbonnement(id, dto, context || {});
      this.logger.log(` [contrat.lierAbonnement] Abonnement lié: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.lierAbonnement] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.lierCompteur')
  async lierCompteur(@Payload() data: { id: string; context?: any } & LienCompteurDto) {
    this.logger.log(` [contrat.lierCompteur] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.commandService.lierCompteur(id, dto, context || {});
      this.logger.log(` [contrat.lierCompteur] Compteur lié: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.lierCompteur] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.dissocierCompteur')
  async dissocierCompteur(@Payload() data: { id: string; context?: any }) {
    this.logger.log(` [contrat.dissocierCompteur] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.commandService.dissocierCompteur(data.id, data.context || {});
      this.logger.log(` [contrat.dissocierCompteur] Compteur dissocié: ${data.id}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.dissocierCompteur] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === AUDIT & HISTORIQUE ===
  @MessagePattern('contrat.getAuditTrail')
  async getAuditTrail(@Payload() data: { id: string; options?: any; context?: any }) {
    this.logger.log(` [contrat.getAuditTrail] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.queryService.getAuditTrail(data.id, data.context || {}, data.options);
      this.logger.log(` [contrat.getAuditTrail] Audit trail récupéré: ${data.id}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.getAuditTrail] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.getCompteurHistorique')
  async getCompteurHistorique(@Payload() data: { id: string; context?: any }) {
    this.logger.log(` [contrat.getCompteurHistorique] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.queryService.getCompteurHistorique(data.id, data.context || {});
      this.logger.log(` [contrat.getCompteurHistorique] Historique récupéré: ${data.id}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.getCompteurHistorique] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === RECHERCHE & STATISTIQUES ===
  @MessagePattern('contrat.searchContrats')
  async searchContrats(@Payload() data: {
    search?: string;
    statut?: string;
    dateDebut?: Date;
    dateFin?: Date;
    proprietaireId?: string;
    tenantId: string;
    page?: number;
    limit?: number;
  }) {
    this.logger.log(` [contrat.searchContrats] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.queryService.searchContrats(data);
      this.logger.log(` [contrat.searchContrats] Recherche effectuée`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.searchContrats] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.getContratStats')
  async getContratStats(@Payload() data: { context?: any }) {
    this.logger.log(` [contrat.getContratStats] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.queryService.getContratStats(data.context || {});
      this.logger.log(` [contrat.getContratStats] Statistiques récupérées`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.getContratStats] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.generateVirtualMeter')
  async generateVirtualMeter(@Payload() data: { adresse: any; zone: string; context?: any }) {
    this.logger.log(` [contrat.generateVirtualMeter] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { context, ...meterData } = data;
      const result = await this.interServiceService.generateVirtualMeter({
        ...meterData,
        tenantId: context?.tenantId
      });
      this.logger.log(` [contrat.generateVirtualMeter] Compteur virtuel généré: ${result.id}`);
      return result;
    } catch (e) {
      this.logger.error(` [contrat.generateVirtualMeter] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern({ cmd: 'generate_test_compteurs' })
  async generateTestCompteurs(@Payload() data: { tenantId: string, count?: number }) {
    this.logger.log(` [generate_test_compteurs] Requête reçue: ${JSON.stringify(data)}`);
    
    try {
      const result = await this.compteurService.generateTestCompteurs(data.tenantId, data.count);
      return result;
    } catch (error) {
      this.logger.error(` [generate_test_compteurs] Erreur: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Erreur: ${error.message}`,
      };
    }
  }

  @MessagePattern({ cmd: 'find_all_compteurs' })
  async findAllCompteurs(@Payload() data: { tenantId: string, page?: number, limit?: number }) {
    this.logger.log(` [find_all_compteurs] Requête reçue: ${JSON.stringify(data)}`);
    
    try {
      const options: any = {
        where: { tenantId: data.tenantId },
      };

      if (data.page && data.limit) {
        options.offset = (data.page - 1) * data.limit;
        options.limit = data.limit;
      }

      const compteurs = await this.compteurService.findAll(options);
      return {
        success: true,
        data: compteurs,
      };
    } catch (error) {
      this.logger.error(` [find_all_compteurs] Erreur: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Erreur: ${error.message}`,
      };
    }
  }

  @MessagePattern({ cmd: 'find_compteur_by_id' })
  async findCompteurById(@Payload() data: { id: string, tenantId: string }) {
    this.logger.log(` [find_compteur_by_id] Requête reçue: ${JSON.stringify(data)}`);
    
    try {
      const compteur = await this.compteurService.findOne(data.id, data.tenantId);
      return {
        success: true,
        data: compteur,
      };
    } catch (error) {
      this.logger.error(` [find_compteur_by_id] Erreur: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Erreur: ${error.message}`,
      };
    }
  }

  @MessagePattern({ cmd: 'find_compteur_readings' })
  async findCompteurReadings(@Payload() data: { id: string, tenantId: string }) {
    this.logger.log(` [find_compteur_readings] Requête reçue: ${JSON.stringify(data)}`);
    
    try {
      const readings = await this.compteurService.findCompteurReadings(data.id, data.tenantId);
      return {
        success: true,
        data: readings,
      };
    } catch (error) {
      this.logger.error(` [find_compteur_readings] Erreur: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Erreur: ${error.message}`,
      };
    }
  }
}