import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ListClientsDto } from './dto/list-clients.dto';
import { AuthService } from '../auth/auth.service';
import { TokenUser } from '../auth/interfaces/token-user.interface';

@Controller()
export class ClientsMessageHandler {
  private readonly logger = new Logger('ClientsMessageHandler');

  constructor(
    private readonly clientsService: ClientsService,
    private readonly authService: AuthService
  ) {
    this.logger.log('ClientsMessageHandler initialized');
    this.logger.log('Registered message patterns: clients.{create,list,getById,update,delete}');
  }

  @MessagePattern('clients.create')
  async createClient(@Payload() data: CreateClientDto & { token: string }) {
    this.logger.log(`Received clients.create request for email: ${data.email}`);
    try {
      console.log('[DEBUG] Received clients.create with data:', JSON.stringify({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email
      }));
      
      // Vérifier le token et récupérer l'agence de l'utilisateur
      const tokenData: TokenUser = await this.authService.getUserFromToken({ token: data.token });
      if (!tokenData?.user?.agencyId) {
        throw new Error('Token invalide ou ID d\'agence manquant');
      }
      
      // Créer le client
      const result = await this.clientsService.create(
        tokenData.user.agencyId,
        data
      );
      
      console.log('[DEBUG] Client created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('[ERROR] Client creation failed:', error.message);
      console.error('[ERROR] Full error details:', error);
      return { 
        status: 'error', 
        message: error.message || 'Erreur serveur interne',
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  @MessagePattern('clients.list')
  async listClients(data: any): Promise<any> {
    const logger = new Logger('ClientsMessageHandler');
    logger.debug(`Received clients.list message: ${JSON.stringify(data)}`);
    
    try {
      const { page = 1, limit = 10, search = '', type = '', statut = '', token = '' } = data;
      
      logger.log(`Listing clients with params: page=${page}, limit=${limit}, search=${search}, type=${type}, statut=${statut}`);
      
      // Extraire l'agencyId du token si disponible
      let agencyId = null;
      if (token) {
        try {
          const tokenData: TokenUser = await this.authService.getUserFromToken({ token });
          if (tokenData?.user?.agencyId) {
            agencyId = tokenData.user.agencyId;
            logger.log(`Using agencyId from token: ${agencyId}`);
          } else {
            logger.warn('Token valid but no agencyId found');
          }
        } catch (tokenError) {
          logger.warn(`Could not extract agencyId from token: ${tokenError.message}`);
        }
      } else {
        logger.warn('No token provided for clients.list');
      }
      
      // Appel au service avec l'agencyId extrait
      const result = await this.clientsService.findAll(
        agencyId,
        page,
        limit,
        search,
        type,
        statut
      );
      
      logger.log(`Found ${result.items.length} clients`);
      return result;
    } catch (error) {
      logger.error(`Error in clients.list: ${error.message}`);
      logger.error(`Stack trace: ${error.stack}`);
      return { 
        status: 'error', 
        message: error.message || 'Erreur serveur interne',
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  @MessagePattern('clients.getById')
  async getClientById(@Payload() data: { id: string; token: string }) {
    this.logger.log(`Received clients.getById request for ID: ${data.id}`);
    try {
      console.log(`[DEBUG] Received clients.getById for client ID: ${data.id}`);
      
      // Vérifier le token et récupérer l'agence de l'utilisateur
      const tokenData: TokenUser = await this.authService.getUserFromToken({ token: data.token });
      if (!tokenData?.user?.agencyId) {
        throw new Error('Token invalide ou ID d\'agence manquant');
      }
      
      // Récupérer le client par ID
      const result = await this.clientsService.findById(
        data.id,
        tokenData.user.agencyId
      );
      
      console.log(`[DEBUG] Retrieved client: ${result.id}`);
      return result;
    } catch (error) {
      console.error('[ERROR] Client retrieval failed:', error.message);
      console.error('[ERROR] Full error details:', error);
      return { 
        status: 'error', 
        message: error.message || 'Erreur serveur interne',
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  @MessagePattern('clients.update')
  async updateClient(@Payload() data: { id: string, token: string } & UpdateClientDto) {
    this.logger.log(`Received clients.update request for ID: ${data.id}`);
    try {
      console.log(`[DEBUG] Received clients.update for client ID: ${data.id}`);
      
      // Vérifier le token et récupérer l'agence de l'utilisateur
      const tokenData: TokenUser = await this.authService.getUserFromToken({ token: data.token });
      if (!tokenData?.user?.agencyId) {
        throw new Error('Token invalide ou ID d\'agence manquant');
      }
      
      // Mettre à jour le client
      const result = await this.clientsService.update(
        data.id,
        tokenData.user.agencyId,
        data
      );
      
      console.log(`[DEBUG] Updated client: ${result.id}`);
      return result;
    } catch (error) {
      console.error('[ERROR] Client update failed:', error.message);
      console.error('[ERROR] Full error details:', error);
      return { 
        status: 'error', 
        message: error.message || 'Erreur serveur interne',
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  @MessagePattern('clients.delete')
  async deleteClient(@Payload() data: { id: string, token: string }) {
    this.logger.log(`Received clients.delete request for ID: ${data.id}`);
    try {
      console.log(`[DEBUG] Received clients.delete for client ID: ${data.id}`);
      
      // Vérifier le token et récupérer l'agence de l'utilisateur
      const tokenData: TokenUser = await this.authService.getUserFromToken({ token: data.token });
      if (!tokenData?.user?.agencyId) {
        throw new Error('Token invalide ou ID d\'agence manquant');
      }
      
      // Vérifier que l'utilisateur a les droits d'administrateur ou gestionnaire clients
      if (!['ADMIN', 'GESTIONNAIRE_CLIENTS'].includes(tokenData.user.role)) {
        throw new Error('Droits insuffisants pour supprimer un client');
      }
      
      // Supprimer le client
      await this.clientsService.delete(
        data.id,
        tokenData.user.agencyId
      );
      
      console.log(`[DEBUG] Deleted client: ${data.id}`);
      return { message: 'Client supprimé avec succès' };
    } catch (error) {
      console.error('[ERROR] Client deletion failed:', error.message);
      console.error('[ERROR] Full error details:', error);
      return { 
        status: 'error', 
        message: error.message || 'Erreur serveur interne',
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }
}
