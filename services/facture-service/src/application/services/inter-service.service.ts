import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

/**
 * Service pour gérer les communications inter-services
 */
@Injectable()
export class InterServiceService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Émet un événement à destination du service de messagerie
   */
  async emitEvent(event: string, data: any): Promise<void> {
    const mailerUrl = this.configService.get<string>('MAILER_SERVICE_URL');
    if (!mailerUrl) {
      throw new Error('MAILER_SERVICE_URL non défini');
    }

    try {
      await firstValueFrom(
        this.httpService.post(`${mailerUrl}/events`, {
          event,
          data
        })
      );
    } catch (error) {
      console.error(`Erreur lors de l'émission de l'événement ${event}:`, error.message);
      throw new Error(`Échec de l'envoi de l'événement ${event}: ${error.message}`);
    }
  }

  /**
   * Récupère les informations d'un contrat
   */
  async getContratById(contratId: string): Promise<any> {
    const contratServiceUrl = this.configService.get<string>('CONTRAT_SERVICE_URL');
    if (!contratServiceUrl) {
      throw new Error('CONTRAT_SERVICE_URL non défini');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(`${contratServiceUrl}/contrats/${contratId}`)
      );

      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du contrat ${contratId}:`, error.message);
      return null;
    }
  }

  /**
   * Récupère les relevés d'un compteur pour une période donnée
   */
  async getRelevesCompteur(compteurId: string, options: { dateDebut: Date, dateFin: Date }): Promise<any[]> {
    const compteurServiceUrl = this.configService.get<string>('COMPTEUR_SERVICE_URL');
    if (!compteurServiceUrl) {
      // Fallback sur le service de contrat qui peut aussi gérer les compteurs
      const contratServiceUrl = this.configService.get<string>('CONTRAT_SERVICE_URL');
      if (!contratServiceUrl) {
        throw new Error('Aucun service pour les compteurs n\'est défini');
      }

      try {
        const response = await firstValueFrom(
          this.httpService.get<any>(`${contratServiceUrl}/compteurs/${compteurId}/releves`, {
            params: {
              dateDebut: options.dateDebut.toISOString(),
              dateFin: options.dateFin.toISOString()
            }
          })
        );

        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la récupération des relevés pour le compteur ${compteurId}:`, error.message);
        return [];
      }
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(`${compteurServiceUrl}/compteurs/${compteurId}/releves`, {
          params: {
            dateDebut: options.dateDebut.toISOString(),
            dateFin: options.dateFin.toISOString()
          }
        })
      );

      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des relevés pour le compteur ${compteurId}:`, error.message);
      return [];
    }
  }

  /**
   * Récupère les relevés de compteur
   */
  async getCompteurReadings(compteurId: string, options: {
    dateDebut?: Date;
    dateFin?: Date;
  } = {}): Promise<any[]> {
    const compteurServiceUrl = this.configService.get<string>('COMPTEUR_SERVICE_URL');
    if (!compteurServiceUrl) {
      throw new Error('COMPTEUR_SERVICE_URL non défini');
    }

    const params: Record<string, string> = {};
    if (options.dateDebut) params.dateDebut = options.dateDebut.toISOString();
    if (options.dateFin) params.dateFin = options.dateFin.toISOString();

    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(`${compteurServiceUrl}/compteurs/${compteurId}/releves`, { params })
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des relevés du compteur ${compteurId}:`, error.message);
      throw new Error(`Relevés de compteur non trouvés: ${error.message}`);
    }
  }

  /**
   * Récupère les informations d'un client
   */
  async getClientInfo(clientId: string): Promise<any> {
    const clientServiceUrl = this.configService.get<string>('CLIENT_SERVICE_URL');
    if (!clientServiceUrl) {
      throw new Error('CLIENT_SERVICE_URL non défini');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(`${clientServiceUrl}/clients/${clientId}`)
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du client ${clientId}:`, error.message);
      throw new Error(`Client non trouvé: ${error.message}`);
    }
  }

  /**
   * Récupère les tarifs applicables
   */
  async getTarifs(options: {
    date?: Date;
    type?: string;
    zone?: string;
  } = {}): Promise<any[]> {
    const tarifServiceUrl = this.configService.get<string>('TARIF_SERVICE_URL');
    if (!tarifServiceUrl) {
      throw new Error('TARIF_SERVICE_URL non défini');
    }

    const params: Record<string, string> = {};
    if (options.date) params.date = options.date.toISOString();
    if (options.type) params.type = options.type;
    if (options.zone) params.zone = options.zone;

    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(`${tarifServiceUrl}/tarifs`, { params })
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tarifs:`, error.message);
      throw new Error(`Tarifs non trouvés: ${error.message}`);
    }
  }
}
