import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Sequelize } from 'sequelize';
import { Inject } from '@nestjs/common';

export interface ClientInfo {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  statut: string;
}

export interface CompteurInfo {
  id: string;
  numero: string;
  type: string;
  adresse: string;
  statut: string;
  coordonnees?: {
    latitude: number;
    longitude: number;
  };
}

export interface AbonnementInfo {
  id: string;
  nom: string;
  type: string;
  tarification: any;
  statut: string;
}

export interface InterventionInfo {
  id: string;
  type: string;
  statut: string;
  dateCreation: Date;
  dateRealisation?: Date;
  technicienId?: string;
}

@Injectable()
export class InterServiceService {
  private readonly clientService: ClientProxy;
  private readonly compteurService: ClientProxy;
  private readonly abonnementService: ClientProxy;
  private readonly operationService: ClientProxy;
  private readonly mailerService: ClientProxy;
  private readonly interventionService: ClientProxy;
  private readonly logger: Logger;

  constructor(@Inject('SEQUELIZE') private sequelize: any) {
    this.logger = new Logger(InterServiceService.name);
    
    // URL RabbitMQ avec authentification
    const rabbitmqUrl = 'amqp://guest:guest@rabbitmq:5672';
    
    this.clientService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'client_queue',
        queueOptions: { durable: true },
      }
    });

    this.compteurService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'compteur_queue',
        queueOptions: { durable: true },
      }
    });

    this.abonnementService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'abonnement_queue',
        queueOptions: { durable: true },
      }
    });

    this.operationService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'operation_queue',
        queueOptions: { durable: true },
      }
    });
    
    this.mailerService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'mailer_queue',
        queueOptions: { durable: true },
      }
    });

    this.interventionService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'intervention_queue',
        queueOptions: { durable: true },
      }
    });
  }

  // === GESTION DES CLIENTS ===
  async getClientInfo(clientId: string, tenantId?: string): Promise<ClientInfo> {
    try {
      return await this.clientService.send('client.get', { id: clientId, tenantId }).toPromise();
    } catch (error) {
      throw new HttpException(`Erreur lors de la récupération du client: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async validateClient(clientId: string): Promise<boolean> {
    try {
      const client = await this.getClientInfo(clientId);
      return client && client.statut === 'ACTIF';
    } catch (error) {
      return false;
    }
  }

  // === GESTION DES COMPTEURS ===
  async getCompteurInfo(compteurId: string): Promise<CompteurInfo> {
    try {
      return await this.compteurService.send('compteur.get', { id: compteurId }).toPromise();
    } catch (error) {
      throw new HttpException(`Erreur lors de la récupération du compteur: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async validateCompteur(compteurId: string): Promise<boolean> {
    try {
      const compteur = await this.getCompteurInfo(compteurId);
      return compteur && compteur.statut === 'ACTIF';
    } catch (error) {
      return false;
    }
  }

  async checkCompteurAvailability(compteurId: string): Promise<boolean> {
    try {
      return await this.compteurService.send('compteur.check-availability', { id: compteurId }).toPromise();
    } catch (error) {
      return false;
    }
  }

  // === GÉNÉRATION DE COMPTEURS VIRTUELS ===
  async generateVirtualMeter(data: { adresse: any; zone: string; tenantId?: string; numeroCompteur?: string }) {
    try {
      // Générer un identifiant unique pour le compteur virtuel
      const uuid = require('uuid').v4();
      
      // Formater l'adresse pour la clé de génération
      const adresse = data.adresse || {};
      const adresseKey = `${adresse.codePostal || '00000'}-${(adresse.rue || '').substring(0, 10).replace(/\s/g, '')}`;
      
      // Utiliser le numéro de compteur fourni ou en générer un nouveau
      let numeroCompteur;
      if (data.numeroCompteur) {
        numeroCompteur = data.numeroCompteur;
        this.logger.log(`Utilisation du numéro de compteur fourni: ${numeroCompteur}`);
      } else {
        // Générer un numéro de compteur basé sur la zone et l'adresse
        const zonePrefix = data.zone?.substring(0, 2).toUpperCase() || 'XX';
        numeroCompteur = `VM-${zonePrefix}-${adresseKey}-${Date.now().toString().substring(6)}`;
      }
      
      // Création directe du compteur dans la base de données
      try {
        const compteurModel = this.sequelize.models.Compteur;
        if (!compteurModel) {
          throw new Error('Modèle Compteur non disponible');
        }

        this.logger.log(`Création directe du compteur ${numeroCompteur} dans la base de données...`);
        
        const compteurData = {
          id: uuid,
          numero: numeroCompteur,
          type: data.numeroCompteur ? 'PHYSIQUE' : 'VIRTUEL',
          statut: 'ACTIF',
          adresse: adresse.rue ? `${adresse.rue}, ${adresse.codePostal} ${adresse.ville}` : 'Adresse non spécifiée',
          coordonnees: JSON.stringify({
            latitude: 0,
            longitude: 0
          }),
          zone: data.zone,
          createdAt: new Date(),
          updatedAt: new Date(),
          tenantId: data.tenantId
        };
        
        await compteurModel.create(compteurData);
        this.logger.log(`Compteur ${numeroCompteur} créé avec succès (id: ${uuid})`);
        
        // Retourner le compteur virtuel créé
        return {
          id: uuid,
          numero: numeroCompteur,
          type: data.numeroCompteur ? 'PHYSIQUE' : 'VIRTUEL',
          statut: 'ACTIF',
          adresse: compteurData.adresse,
          coordonnees: {
            latitude: 0,
            longitude: 0
          },
          zone: data.zone,
          dateCreation: compteurData.createdAt,
          tenantId: data.tenantId
        };
      } catch (error) {
        this.logger.error(`Erreur lors de la création du compteur ${numeroCompteur}:`, error?.message || 'Erreur inconnue');
        throw new HttpException(
          `Erreur lors de la création du compteur: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      this.logger.error('Erreur lors de la génération du compteur:', error);
      throw new HttpException(
        `Erreur lors de la génération du compteur: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // === MISE À JOUR DES INFOS CLIENT ===
  async updateClientInfo(clientId: string, data: any): Promise<boolean> {
    try {
      this.logger.log(`Mise à jour des infos du client ${clientId}: ${JSON.stringify(data)}`);
      
      // Pour les informations client, nous n'avons pas accès au modèle User dans ce service
      // Nous devons donc utiliser RabbitMQ en tant que mécanisme de communication principal
      try {
        this.logger.log(`Envoi de la mise à jour du client ${clientId} via RabbitMQ...`);
        this.clientService.emit('client.update', {
          id: clientId,
          ...data
        });
        this.logger.log(`Message de mise à jour du client ${clientId} envoyé avec succès`);
        
        // SOLUTION TEMPORAIRE: Stockage local des informations client
        // Enregistrer les détails du client dans le modèle Contrat si la propriété clientInfo existe
        try {
          if (this.sequelize?.models?.Contrat) {
            this.logger.log(`Recherche du contrat associé au client ${clientId}...`);
            const contrats = await this.sequelize.models.Contrat.findAll({
              where: {
                clientId: clientId
              }
            });
            
            if (contrats && contrats.length > 0) {
              this.logger.log(`${contrats.length} contrat(s) trouvé(s) pour le client ${clientId}`);
              
              for (const contrat of contrats) {
                let clientInfo = contrat.clientInfo || {};
                if (typeof clientInfo === 'string') {
                  try {
                    clientInfo = JSON.parse(clientInfo);
                  } catch (e) {
                    clientInfo = {};
                  }
                }
                
                // Mise à jour des informations bancaires localement
                if (data.rib) {
                  clientInfo.rib = data.rib;
                }
                
                contrat.clientInfo = typeof contrat.clientInfo === 'string' ? 
                  JSON.stringify(clientInfo) : clientInfo;
                  
                await contrat.save();
                this.logger.log(`Informations client mises à jour localement pour le contrat ${contrat.id}`);
              }
            } else {
              this.logger.warn(`Aucun contrat trouvé pour le client ${clientId}`);
            }
          }
        } catch (localError) {
          this.logger.warn(`Erreur lors de la mise à jour locale des infos client: ${localError.message}`);
          // On continue même si la mise à jour locale échoue
        }
        
        return true;
      } catch (rmqError) {
        this.logger.error(`Erreur lors de l'envoi du message RabbitMQ:`, rmqError?.message);
        return false;
      }
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du client ${clientId}:`, error);
      return false;
    }
  }

  // === GESTION DES ABONNEMENTS ===
  async getAbonnementInfo(abonnementId: string): Promise<AbonnementInfo> {
    try {
      return await this.abonnementService.send('abonnement.get', { id: abonnementId }).toPromise();
    } catch (error) {
      throw new HttpException(`Erreur lors de la récupération de l'abonnement: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async validateAbonnement(abonnementId: string): Promise<boolean> {
    try {
      const abonnement = await this.getAbonnementInfo(abonnementId);
      return abonnement && abonnement.statut === 'ACTIF';
    } catch (error) {
      return false;
    }
  }

  // === GESTION DES INTERVENTIONS ===
  async createIntervention(interventionData: {
    type: string;
    contratId: string;
    compteurId?: string;
    description?: string;
    datePlanifiee?: Date;
    priorite?: string;
    technicienId?: string;
    tenantId?: string;
    createdBy?: string;
  }): Promise<any> {
    try {
      // Utiliser emit au lieu de send().toPromise() pour éviter les erreurs de promesse
      const interventionId = Math.random().toString(36).substring(2, 15);
      this.operationService.emit('intervention.create', interventionData);
      this.logger.log(`[createIntervention] Intervention émise avec succès: ${interventionId}`);
      return { id: interventionId, ...interventionData, status: 'PLANIFIEE' };
    } catch (error) {
      this.logger.error(`[createIntervention] Erreur: ${error?.message || 'Erreur indéfinie'}`);
      throw new HttpException(`Erreur lors de la création de l'intervention: ${error?.message || 'Erreur indéfinie'}`, HttpStatus.BAD_REQUEST);
    }
  }

  async updateIntervention(interventionId: string, updateData: any): Promise<InterventionInfo> {
    try {
      return await this.operationService.send('intervention.update', { id: interventionId, ...updateData }).toPromise();
    } catch (error) {
      throw new HttpException(`Erreur lors de la mise à jour de l'intervention: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async getInterventionInfo(interventionId: string): Promise<InterventionInfo> {
    try {
      return await this.operationService.send('intervention.get', { id: interventionId }).toPromise();
    } catch (error) {
      throw new HttpException(`Erreur lors de la récupération de l'intervention: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async createInstallationIntervention(data: { 
    contratId: string; 
    tenantId?: string;
    compteurId?: string;
    utilisateurId?: string;
  }): Promise<InterventionInfo> {
    try {
      // Calcul d'une date planifiée pour le lendemain à 8h
      const datePlanifiee = new Date();
      datePlanifiee.setDate(datePlanifiee.getDate() + 1);
      datePlanifiee.setHours(8, 0, 0, 0);
      
      this.logger.log(`Création d'une intervention d'installation pour le contrat ${data.contratId} prévue le ${datePlanifiee.toISOString()}`);
      
      return await this.interventionService.send('intervention.create', {
        contratId: data.contratId,
        type: 'INSTALLATION',
        datePlanifiee: datePlanifiee.toISOString(), // Format ISO pour la date
        description: 'Pose compteur',
        compteurId: data.compteurId,
        utilisateurId: data.utilisateurId
      }).toPromise();
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l'intervention: ${error.message}`);
      throw error;
    }
  }

  // === NOTIFICATIONS ===
  async notifyClient(clientId: string, message: string, type: 'EMAIL' | 'SMS' = 'EMAIL'): Promise<void> {
    try {
      await this.clientService.send('client.notify', { clientId, message, type }).toPromise();
    } catch (error) {
      this.logger.error('Erreur lors de la notification du client:', error);
    }
  }

  async notifyCosignataire(cosignataireId: string, message: string): Promise<void> {
    try {
      await this.clientService.send('client.notify', { clientId: cosignataireId, message, type: 'EMAIL' }).toPromise();
    } catch (error) {
      this.logger.error('Erreur lors de la notification du cosignataire:', error);
    }
  }

  // === NOTIFICATION OPERATION-SERVICE ===
  async notifyOperationService(data: {
    action: string;
    contratId: string;
    numero?: string;
    tenantId: string;
    userId?: string;
  }): Promise<void> {
    try {
      const result = await this.operationService.send('contrat.notify', {
        ...data,
        timestamp: new Date().toISOString(),
        service: 'contrat-service'
      }).toPromise();
      
      if (!result || result.success === false) {
        throw new Error('Réponse négative du service operation');
      }
    } catch (error) {
      // Log détaillé de l'erreur pour debugging
      this.logger.error('Erreur notification operation-service:', {
        action: data.action,
        contratId: data.contratId,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Relancer l'erreur pour gestion par le service appelant
      throw new Error(`Échec de notification operation-service: ${error.message}`);
    }
  }

  // === VALIDATION ASSIGNATION COMPTEUR ===
  async validateCompteurAssignment(data: {
    contratId: string;
    compteurId: string;
    tenantId: string;
  }): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Vérifier que le compteur existe et est actif
      const compteur = await this.getCompteurInfo(data.compteurId);
      if (!compteur) {
        errors.push('Compteur non trouvé');
      } else if (compteur.statut !== 'ACTIF') {
        errors.push('Compteur non actif');
      } else {
        // Vérifier la disponibilité du compteur
        const isAvailable = await this.checkCompteurAvailability(data.compteurId);
        if (!isAvailable) {
          errors.push('Compteur non disponible pour assignation');
        }
      }
    } catch (error) {
      errors.push('Erreur lors de la validation du compteur');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // === VALIDATIONS COMPLEXES ===
  async validateContratCreation(data: {
    clientId: string;
    compteurId?: string;
    abonnementId?: string;
  }): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation du client
    try {
      const client = await this.getClientInfo(data.clientId);
      if (!client) {
        errors.push('Client non trouvé');
      } else if (client.statut !== 'ACTIF') {
        errors.push('Client non actif');
      }
    } catch (error) {
      errors.push('Erreur lors de la validation du client');
    }

    // Validation du compteur
    if (data.compteurId) {
      try {
        const compteur = await this.getCompteurInfo(data.compteurId);
        if (!compteur) {
          errors.push('Compteur non trouvé');
        } else if (compteur.statut !== 'ACTIF') {
          errors.push('Compteur non actif');
        } else {
          const isAvailable = await this.checkCompteurAvailability(data.compteurId);
          if (!isAvailable) {
            errors.push('Compteur déjà associé à un autre contrat');
          }
        }
      } catch (error) {
        errors.push('Erreur lors de la validation du compteur');
      }
    }

    // Validation de l'abonnement
    if (data.abonnementId) {
      try {
        const abonnement = await this.getAbonnementInfo(data.abonnementId);
        if (!abonnement) {
          errors.push('Abonnement non trouvé');
        } else if (abonnement.statut !== 'ACTIF') {
          errors.push('Abonnement non actif');
        }
      } catch (error) {
        errors.push('Erreur lors de la validation de l\'abonnement');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // === EMISSION D'ÉVÉNEMENTS ===
  async emitEvent(pattern: string, data: any): Promise<void> {
    try {
      this.logger.log(`Émission d'événement ${pattern}`, data);
      this.mailerService.emit(pattern, data).toPromise();
    } catch (error) {
      this.logger.error(`Erreur lors de l'émission de l'événement ${pattern}:`, error);
      // On ne propage pas l'erreur pour ne pas bloquer le flux principal
    }
  }

  // === FONCTIONS SUPPLÉMENTAIRES UTILISÉES PAR NOTIFICATION SERVICE ===

  async getContractInfo(contratId: string, tenantId?: string): Promise<any> {
    try {
      return await this.operationService.send('contrat.get', { id: contratId, tenantId }).toPromise();
    } catch (error) {
      throw new HttpException(`Erreur lors de la récupération du contrat: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async sendEmail(payload: { to: string; subject: string; template: string; data: any; tenantId?: string }): Promise<{ success: boolean; messageId?: string }> {
    try {
      return await this.operationService.send('notification.email', payload).toPromise();
    } catch (error) {
      this.logger.error('Erreur sendEmail inter-service:', error);
      return { success: false };
    }
  }

  async sendSMS(payload: { to: string; message: string; tenantId?: string }): Promise<{ success: boolean; messageId?: string }> {
    try {
      return await this.operationService.send('notification.sms', payload).toPromise();
    } catch (error) {
      this.logger.error('Erreur sendSMS inter-service:', error);
      return { success: false };
    }
  }

  async getContractsNeedingReminders(): Promise<any[]> {
    try {
      return await this.operationService.send('contrat.reminders', {}).toPromise();
    } catch (error) {
      this.logger.error('Erreur récupération contrats pour rappels:', error);
      return [];
    }
  }
}