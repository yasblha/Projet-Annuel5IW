import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContratService } from '@application/services/contrat.service';
import { CreateContratDto } from '@application/dtos/create-contrat.dto';
import { UpdateContratDto } from '@application/dtos/update-contrat.dto';
import { CreateCosignataireDto, UpdateCosignataireDto } from '@application/dtos/cosignataire.dto';
import { SignatureContratDto } from '@application/dtos/signature-contrat.dto';
import { ResiliationContratDto } from '@application/dtos/resiliation-contrat.dto';
import { SuspensionContratDto } from '@application/dtos/suspension-contrat.dto';
import { RenouvellementContratDto } from '@application/dtos/renouvellement-contrat.dto';
import { LienAbonnementDto, LienCompteurDto, LienClientDto } from '@application/dtos/lien-contrat.dto';

@Controller()
export class ContratMicroservice {
  private readonly logger = new Logger(ContratMicroservice.name);
  constructor(private readonly contratService: ContratService) {}

  // === CRUD CONTRATS ===
  @MessagePattern('contrat.findAll')
  async findAll(@Payload() data: { page?: number; limit?: number; search?: string; context?: any }) {
    this.logger.log(`🔍 [contrat.findAll] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.findAll({
        page: data.page,
        limit: data.limit,
        search: data.search,
        tenantId: data.context?.tenantId,
        userId: data.context?.userId
      });
      this.logger.log(`✅ [contrat.findAll] ${result.length} contrats trouvés.`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.findAll] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.findById')
  async findById(@Payload() data: { id: string; context?: any }) {
    this.logger.log(`🔍 [contrat.findById] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.findById(data.id, data.context?.tenantId, data.context?.userId);
      if (result) {
        this.logger.log(`✅ [contrat.findById] Contrat trouvé: ${data.id}`);
      } else {
        this.logger.warn(`⚠️ [contrat.findById] Contrat non trouvé: ${data.id}`);
      }
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.findById] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.create')
  async create(@Payload() data: CreateContratDto & { context?: any }) {
    this.logger.log(`🔍 [contrat.create] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.create(data, data.context || {});
      this.logger.log(`✅ [contrat.create] Contrat créé: ${JSON.stringify(result)}`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.create] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.update')
  async update(@Payload() data: { id: string; context?: any } & UpdateContratDto) {
    this.logger.log(`🔍 [contrat.update] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.contratService.update(id, dto, context || {});
      if (result) {
        this.logger.log(`✅ [contrat.update] Contrat mis à jour: ${id}`);
      } else {
        this.logger.warn(`⚠️ [contrat.update] Contrat non trouvé: ${id}`);
      }
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.update] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.delete')
  async delete(@Payload() data: { id: string; context?: any }) {
    this.logger.log(`🔍 [contrat.delete] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.delete(data.id, data.context || {});
      if (result) {
        this.logger.log(`✅ [contrat.delete] Contrat supprimé: ${data.id}`);
      } else {
        this.logger.warn(`⚠️ [contrat.delete] Contrat non trouvé: ${data.id}`);
      }
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.delete] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === COSIGNATAIRES ===
  @MessagePattern('contrat.getCosignatairesByContrat')
  async getCosignatairesByContrat(@Payload() data: { contratId: string; context?: any }) {
    this.logger.log(`🔍 [contrat.getCosignatairesByContrat] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.getCosignatairesByContrat(data.contratId, data.context?.tenantId);
      this.logger.log(`✅ [contrat.getCosignatairesByContrat] ${result.length} cosignataires trouvés`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.getCosignatairesByContrat] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.createCosignataire')
  async createCosignataire(@Payload() data: { contratId: string; context?: any } & CreateCosignataireDto) {
    this.logger.log(`🔍 [contrat.createCosignataire] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { contratId, context, ...dto } = data;
      const result = await this.contratService.createCosignataire(contratId, dto, context || {});
      this.logger.log(`✅ [contrat.createCosignataire] Cosignataire créé`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.createCosignataire] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.updateCosignataire')
  async updateCosignataire(@Payload() data: { cosignataireId: string; context?: any } & UpdateCosignataireDto) {
    this.logger.log(`🔍 [contrat.updateCosignataire] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { cosignataireId, context, ...dto } = data;
      const result = await this.contratService.updateCosignataire(cosignataireId, dto, context || {});
      this.logger.log(`✅ [contrat.updateCosignataire] Cosignataire mis à jour`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.updateCosignataire] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.signCosignataire')
  async signCosignataire(@Payload() data: { cosignataireId: string; context?: any }) {
    this.logger.log(`🔍 [contrat.signCosignataire] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.updateCosignataire(data.cosignataireId, {
        signatureElectronique: true,
        signatureDate: new Date(),
        statutInvitation: 'ACCEPTE',
      }, data.context || {});
      this.logger.log(`✅ [contrat.signCosignataire] Cosignataire signé`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.signCosignataire] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === SIGNATURE ===
  @MessagePattern('contrat.signContrat')
  async signContrat(@Payload() data: { id: string; context?: any } & SignatureContratDto) {
    this.logger.log(`🔍 [contrat.signContrat] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.contratService.signContrat(id, dto, context || {});
      this.logger.log(`✅ [contrat.signContrat] Contrat signé: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.signContrat] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === RÉSILIATION ===
  @MessagePattern('contrat.resilierContrat')
  async resilierContrat(@Payload() data: { id: string; context?: any } & ResiliationContratDto) {
    this.logger.log(`🔍 [contrat.resilierContrat] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.contratService.resilierContrat(id, dto, context || {});
      this.logger.log(`✅ [contrat.resilierContrat] Contrat résilié: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.resilierContrat] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === SUSPENSION ===
  @MessagePattern('contrat.suspendreContrat')
  async suspendreContrat(@Payload() data: { id: string; context?: any } & SuspensionContratDto) {
    this.logger.log(`🔍 [contrat.suspendreContrat] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.contratService.suspendreContrat(id, dto, context || {});
      this.logger.log(`✅ [contrat.suspendreContrat] Contrat suspendu: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.suspendreContrat] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === RENOUVELLEMENT ===
  @MessagePattern('contrat.renouvelerContrat')
  async renouvelerContrat(@Payload() data: { id: string; context?: any } & RenouvellementContratDto) {
    this.logger.log(`🔍 [contrat.renouvelerContrat] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.contratService.renouvelerContrat(id, dto, context || {});
      this.logger.log(`✅ [contrat.renouvelerContrat] Contrat renouvelé: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.renouvelerContrat] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === LIENS ===
  @MessagePattern('contrat.lierAbonnement')
  async lierAbonnement(@Payload() data: { id: string; context?: any } & LienAbonnementDto) {
    this.logger.log(`🔍 [contrat.lierAbonnement] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.contratService.lierAbonnement(id, dto, context || {});
      this.logger.log(`✅ [contrat.lierAbonnement] Abonnement lié: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.lierAbonnement] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.lierCompteur')
  async lierCompteur(@Payload() data: { id: string; context?: any } & LienCompteurDto) {
    this.logger.log(`🔍 [contrat.lierCompteur] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const { id, context, ...dto } = data;
      const result = await this.contratService.lierCompteur(id, dto, context || {});
      this.logger.log(`✅ [contrat.lierCompteur] Compteur lié: ${id}`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.lierCompteur] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.dissocierCompteur')
  async dissocierCompteur(@Payload() data: { id: string; context?: any }) {
    this.logger.log(`🔍 [contrat.dissocierCompteur] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.dissocierCompteur(data.id, data.context || {});
      this.logger.log(`✅ [contrat.dissocierCompteur] Compteur dissocié: ${data.id}`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.dissocierCompteur] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  // === AUDIT & HISTORIQUE ===
  @MessagePattern('contrat.getAuditTrail')
  async getAuditTrail(@Payload() data: { id: string; options?: any; context?: any }) {
    this.logger.log(`🔍 [contrat.getAuditTrail] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.getAuditTrail(data.id, data.context || {}, data.options);
      this.logger.log(`✅ [contrat.getAuditTrail] Audit trail récupéré: ${data.id}`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.getAuditTrail] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.getCompteurHistorique')
  async getCompteurHistorique(@Payload() data: { id: string; context?: any }) {
    this.logger.log(`🔍 [contrat.getCompteurHistorique] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.getCompteurHistorique(data.id, data.context || {});
      this.logger.log(`✅ [contrat.getCompteurHistorique] Historique récupéré: ${data.id}`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.getCompteurHistorique] Erreur: ${e.message}`, e.stack);
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
    this.logger.log(`🔍 [contrat.searchContrats] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.searchContrats(data);
      this.logger.log(`✅ [contrat.searchContrats] Recherche effectuée`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.searchContrats] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }

  @MessagePattern('contrat.getContratStats')
  async getContratStats(@Payload() data: { context?: any }) {
    this.logger.log(`🔍 [contrat.getContratStats] Requête reçue: ${JSON.stringify(data)}`);
    try {
      const result = await this.contratService.getContratStats(data.context || {});
      this.logger.log(`✅ [contrat.getContratStats] Statistiques récupérées`);
      return result;
    } catch (e) {
      this.logger.error(`❌ [contrat.getContratStats] Erreur: ${e.message}`, e.stack);
      throw e;
    }
  }
} 