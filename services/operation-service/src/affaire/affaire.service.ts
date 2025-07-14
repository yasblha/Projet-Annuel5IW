import { Inject, Injectable, Logger } from '@nestjs/common';
import { Tarif } from '@Database/models';
import { CreateAffaireDto } from './dto/create-affaire.dto';
import { ValidateAffaireDto } from './dto/validate-affaire.dto';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AffaireService {
  private readonly logger = new Logger(AffaireService.name);
  private readonly workflowClient: ClientProxy;

  constructor(@Inject('AFFAIRE_MODEL') private readonly model: any) {
    // simple TCP transport to workflow-service (host & port mock)
    this.workflowClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: process.env.WORKFLOW_HOST ?? 'workflow-service', port: +(process.env.WORKFLOW_PORT ?? 3010) },
    });
  }

  // === Create and run eligibility check ===
  async create(dto: CreateAffaireDto) {
    // eligibility (MVP)
    const isEligible = this.checkEligibility(dto.zoneCode, dto.debitDemande);
    const affaire = await this.model.create({
      id: uuid(),
      clientId: dto.clientId,
      zoneCode: dto.zoneCode,
      debitDemande: dto.debitDemande,
      statut: 'EN_COURS',
      validationAssainissement: false,
    });

    if (!isEligible) {
      await affaire.update({ statut: 'REFUSEE' });
      return affaire;
    }
    return affaire;
  }

  async validate(id: string, dto: ValidateAffaireDto) {
    const affaire = await this.model.findByPk(id);
    if (!affaire) throw new Error('Affaire not found');
    if (affaire.statut !== 'EN_COURS') throw new Error('Affaire already traitée');

    // Devis mock calculation
    const montant = dto.montantDevis ?? (await this.calculateDevis(dto.longueurBranchement ?? 10, affaire.zoneCode));

    await affaire.update({
      statut: 'VALIDEE',
      montantDevis: montant,
      validationAssainissement: true,
    });

    // Emit event to workflow-service
    this.workflowClient.emit('affaire.validée', {
      affaireId: affaire.id,
      clientId: affaire.clientId,
      zoneCode: affaire.zoneCode,
      debit: affaire.debitDemande,
      montantDevis: montant,
    }).toPromise().catch(err => this.logger.error('Emit error', err));

    return affaire;
  }

  async list(statut?: string) {
    const where = statut ? { statut } : undefined;
    return this.model.findAll({ where });
  }

  async get(id: string) {
    return this.model.findByPk(id);
  }

  // === Helpers ===
  private checkEligibility(zone: string, debit: number): boolean {
    return ['TLS', 'MPL'].includes(zone) && debit <= 30;
  }

  private async calculateDevis(longueur: number, zone: string): Promise<number> {
    // Read real tarif record (simple example)
    // cast to any to bypass typing issues with Sequelize static methods
    const tarif = await (Tarif as any).findOne({ where: { zone, statut: 'ACTIF' }, order: [['dateDebutValidite', 'DESC']] });
    const prixMetre = tarif ? Number(tarif.get('prixUnitaireM3')) : 100;
    const fraisFixes = tarif ? Number(tarif.get('fraisFixes') ?? 250) : 250;
    return longueur * prixMetre + fraisFixes;
  }
}
