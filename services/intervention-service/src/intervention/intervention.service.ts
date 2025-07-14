import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { v4 as uuid } from 'uuid';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { FinishInterventionDto } from './dto/finish-intervention.dto';
import { InterventionRepository } from '@Database/repositories/intervention.repository';

@Injectable()
export class InterventionService implements OnModuleInit {
  private readonly logger = new Logger(InterventionService.name);
  private readonly workflowClient: ClientProxy;
  private readonly contratClient: ClientProxy;

  constructor(private readonly interventionRepository: InterventionRepository) {
    // RabbitMQ client to workflow-service exchange
    this.workflowClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
        queue: 'workflow_queue',
        queueOptions: { durable: true },
        exchange: 'domain_events',
        exchangeType: 'topic',
      },
    });

    // RabbitMQ client pour écouter le service de contrat
    this.contratClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
        queue: 'contrat_events',
        queueOptions: { durable: true },
        exchange: 'domain_events',
        exchangeType: 'topic',
      },
    });
  }

  async onModuleInit() {
    // TODO: L'écoute d'événements RabbitMQ doit se faire via un microservice dédié ou via MessagePattern
    // La méthode subscribe n'existe pas sur ClientProxy, il faut utiliser un microservice ou un event handler
    // Code retiré pour éviter l'erreur
  }

  // === CRUD ===
  async create(dto: CreateInterventionDto) {
    this.logger.log(`Création d'une intervention: ${JSON.stringify(dto)}`);
    try {
      // Pour les installations liées à un contrat, on n'a pas encore d'utilisateurId ni de compteurId
      const interventionData: any = {
        id: uuid(),
        ...dto,
        statut: 'PROGRAMMEE',
        dateCreation: new Date(),
        dateMaj: new Date(),
      };
      if (dto.type === 'INSTALLATION' && dto.contratId && !dto.compteurId) {
        delete interventionData.compteurId;
        if (!dto.utilisateurId) {
          interventionData.utilisateurId = process.env.SYSTEM_USER_ID || '00000000-0000-0000-0000-000000000000';
        }
        // Correction : datePlanifiee doit être une string ISO
        if (interventionData.datePlanifiee instanceof Date) {
          interventionData.datePlanifiee = interventionData.datePlanifiee.toISOString();
        }
      } else {
        if (!dto.compteurId) {
          throw new Error('compteurId est obligatoire pour ce type d\'intervention');
        }
        if (!dto.utilisateurId) {
          throw new Error('utilisateurId est obligatoire pour ce type d\'intervention');
        }
      }
      this.logger.log(`Données d'intervention préparées: ${JSON.stringify(interventionData)}`);
      const intervention = await this.interventionRepository.create(interventionData);
      this.logger.log(`Intervention créée avec succès: ${intervention.id}`);
      await this.workflowClient.emit('intervention.creee', {
        interventionId: intervention.id,
        type: dto.type,
        contratId: dto.contratId
      }).toPromise().catch(err => this.logger.error('Emit error', err));
      return intervention;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l'intervention: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(filter: any = {}) {
    return this.interventionRepository.findAll(filter);
  }

  async findById(id: string) {
    return this.interventionRepository.findById(id);
  }

  async finish(id: string, dto: FinishInterventionDto) {
    const intervention = await this.interventionRepository.findById(id);
    if (!intervention) throw new Error('Intervention not found');
    await this.interventionRepository.update(id, {
      statut: 'TERMINEE',
      dateRealisee: new Date(),
      resultat: dto.resultat,
      cout: dto.cout,
      dateMaj: new Date(),
    });
    await this.workflowClient.emit('intervention.terminee', {
      interventionId: id,
      contratId: intervention.contratId,
      compteurId: intervention.compteurId,
      type: intervention.type
    }).toPromise().catch(err => this.logger.error('Emit error', err));
    return this.interventionRepository.findById(id);
  }
}
