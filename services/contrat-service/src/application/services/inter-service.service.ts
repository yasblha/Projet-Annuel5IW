import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

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

  constructor() {
    this.clientService = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: 'client-service', port: 3002 }
    });

    this.compteurService = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: 'compteur-service', port: 3004 }
    });

    this.abonnementService = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: 'abonnement-service', port: 3005 }
    });

    this.operationService = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: 'operation-service', port: 3006 }
    });
  }

  // === GESTION DES CLIENTS ===
  async getClientInfo(clientId: string): Promise<ClientInfo> {
    try {
      return await this.clientService.send('client.get', { id: clientId }).toPromise();
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
    description: string;
    priorite?: string;
    technicienId?: string;
  }): Promise<InterventionInfo> {
    try {
      return await this.operationService.send('intervention.create', interventionData).toPromise();
    } catch (error) {
      throw new HttpException(`Erreur lors de la création de l'intervention: ${error.message}`, HttpStatus.BAD_REQUEST);
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

  // === NOTIFICATIONS ===
  async notifyClient(clientId: string, message: string, type: 'EMAIL' | 'SMS' = 'EMAIL'): Promise<void> {
    try {
      await this.clientService.send('client.notify', { clientId, message, type }).toPromise();
    } catch (error) {
      console.error('Erreur lors de la notification du client:', error);
    }
  }

  async notifyCosignataire(cosignataireId: string, message: string): Promise<void> {
    try {
      await this.clientService.send('client.notify', { clientId: cosignataireId, message, type: 'EMAIL' }).toPromise();
    } catch (error) {
      console.error('Erreur lors de la notification du cosignataire:', error);
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
      console.error('Erreur notification operation-service:', {
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
} 