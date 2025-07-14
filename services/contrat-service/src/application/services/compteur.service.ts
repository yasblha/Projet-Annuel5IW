import { Injectable, Logger, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AssignCompteurDto } from '@application/dtos/assign-compteur.dto';
import { CompteurRepository } from '@infrastructure/repositories/compteur.repository';

@Injectable()
export class CompteurService {
  private readonly logger = new Logger(CompteurService.name);

  constructor(
    private readonly compteurRepository: CompteurRepository,
    @Inject('SEQUELIZE') private readonly sequelizeProvider: any,
  ) {
    this.logger.log('CompteurService initialisé');
  }

  /*--------------------------------------------------------------
   *         LECTURE
   *-------------------------------------------------------------*/

  async findAll(options: any = {}) {
    try {
      return await this.compteurRepository.findAll(options);
    } catch (e) {
      this.logger.warn('Modèle Compteur indisponible – données simulées');
      return this.generateMockMeters(10);
    }
  }

  async findOne(id: string, tenantId?: string) {
    try {
      const meter: any = await this.compteurRepository.findById(id);
      if (!meter) return null;
      if (tenantId && meter.tenantId !== tenantId) return null;
      return meter;
    } catch (e) {
      this.logger.warn(`Fallback mock – compteur ${id}`);
      const m = this.generateMockMeters(1)[0];
      m.id = id;
      if (tenantId) m.tenantId = tenantId;
      return m;
    }
  }

  async getCompteursByContratId(contratId: string, tenantId?: string) {
    try {
      return await this.compteurRepository.findAllByContrat(
        contratId,
        tenantId,
      );
    } catch (e) {
      this.logger.warn(`Fallback mock – compteurs du contrat ${contratId}`);
      const mocks = this.generateMockMeters(2);
      mocks.forEach(m => {
        m.contratId = contratId;
        if (tenantId) m.tenantId = tenantId;
      });
      return mocks;
    }
  }

  /*--------------------------------------------------------------
   *         LECTURES (MOCK)
   *-------------------------------------------------------------*/

  async findCompteurReadings(compteurId: string, options: any = {}) {
    this.logger.log(`Readings mock for ${compteurId}`);

    const { startDate, endDate, limit = 10, tenantId } = options;

    const readings = [];
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : now;

    const daysBetween = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const numReadings = Math.min(daysBetween, limit);
    const interval = Math.floor(daysBetween / numReadings);
    let lastValue = Math.floor(Math.random() * 100);

    for (let i = 0; i < numReadings; i++) {
      const readingDate = new Date(
        start.getTime() + i * interval * 24 * 60 * 60 * 1000,
      );
      lastValue += Math.floor(Math.random() * 5) + 1;

      readings.push({
        id: uuidv4(),
        compteurId,
        date: readingDate.toISOString().split('T')[0],
        valeur: lastValue,
        typeReleve: Math.random() > 0.8 ? 'MANUEL' : 'AUTOMATIQUE',
        tenantId: tenantId || 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return readings;
  }

  /*--------------------------------------------------------------
   *         GÉNÉRATION DE DONNÉES DE TEST
   *-------------------------------------------------------------*/

  async generateTestCompteurs(
    tenantId: string | null = null,
    count = 10,
  ) {
    const compteurs = this.generateMockMeters(count).map(c => ({
      ...c,
      tenantId: tenantId ?? c.tenantId,
    }));

    const associations = compteurs.map(c => ({
      id: uuidv4(),
      compteurId: c.id,
      contratId: uuidv4(),
      dateDebut: new Date().toISOString().split('T')[0],
      tenantId: tenantId ?? 'default',
    }));

    return {
      success: true,
      message: `${compteurs.length} compteurs générés (mock)`,
      data: { compteurs, associations },
    };
  }

  /*--------------------------------------------------------------
   *         ASSIGNATION
   *-------------------------------------------------------------*/

  async assignCompteur(dto: AssignCompteurDto, context: any) {
    const { contratId, compteurId } = dto;

    return this.compteurRepository.update(compteurId, {
      contratId,
      updatedBy: context?.userId,
      tenantId: context?.tenantId,
      dateMaj: new Date(),
    });
  }

  /*--------------------------------------------------------------
   *         MOCKS UTILITAIRES
   *-------------------------------------------------------------*/

  private generateMockMeters(count: number) {
    const meters = [];

    for (let i = 0; i < count; i++) {
      meters.push({
        id: uuidv4(),
        serial: `CPT-${Math.floor(Math.random() * 1_000_000)
          .toString()
          .padStart(6, '0')}`,
        type: Math.random() > 0.5 ? 'EAU_POTABLE' : 'ASSAINISSEMENT',
        dateInstallation: new Date().toISOString().split('T')[0],
        statut: 'ACTIF',
        description: `Compteur simulé ${i + 1}/${count}`,
        tenantId: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return meters;
  }
}
