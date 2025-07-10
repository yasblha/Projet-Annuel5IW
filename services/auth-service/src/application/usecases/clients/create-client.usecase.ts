import { Injectable, Logger } from '@nestjs/common';
import { ClientRepository } from '@Database/repositories/client.repository';
import { AdresseRepository } from '@Database/repositories/adresse.repository';
import { EntrepriseRepository } from '@Database/repositories/entreprise.repository';

export interface CreateClientParams {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  type: 'PARTICULIER' | 'ENTREPRISE';
  statut?: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
  tenantId?: string;
  adresse?: AdresseParams;
  entreprise?: EntrepriseParams;
}

export interface AdresseParams {
  type: string;
  ligne1: string;
  ligne2?: string;
  codePostal: string;
  ville: string;
  pays: string;
}

export interface EntrepriseParams {
  nom: string;
  siret?: string;
  adresse?: any;
  contactEmail?: string;
  contactTelephone?: string;
}

@Injectable()
export class CreateClientUseCase {
  private readonly logger = new Logger(CreateClientUseCase.name);

  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly adresseRepository: AdresseRepository,
    private readonly entrepriseRepository: EntrepriseRepository,
  ) {}

  async execute(data: CreateClientParams) {
    this.logger.log(`🔍 [CreateClientUseCase] Début création client: ${data.email}`);
    this.logger.log(`📋 [CreateClientUseCase] Données reçues: ${JSON.stringify(data)}`);

    try {
      // Vérifier si le client existe déjà
      this.logger.log(`🔍 [CreateClientUseCase] Vérification existence email: ${data.email}`);
      const existingClient = await this.clientRepository.findByEmail(data.email);
      if (existingClient) {
        this.logger.warn(`⚠️ [CreateClientUseCase] Client déjà existant: ${data.email}`);
        throw new Error(`Un client avec l'email ${data.email} existe déjà.`);
      }
      this.logger.log(`✅ [CreateClientUseCase] Email disponible`);

      // Vérifier si le téléphone existe déjà (si fourni)
      if (data.telephone) {
        this.logger.log(`🔍 [CreateClientUseCase] Vérification existence téléphone: ${data.telephone}`);
        const existingPhone = await this.clientRepository.findByPhone(data.telephone);
        if (existingPhone) {
          this.logger.warn(`⚠️ [CreateClientUseCase] Téléphone déjà existant: ${data.telephone}`);
          throw new Error(`Un client avec le téléphone ${data.telephone} existe déjà.`);
        }
        this.logger.log(`✅ [CreateClientUseCase] Téléphone disponible`);
      }

      let entrepriseId: string | undefined = undefined;
      
      // Création de l'entreprise si fournie
      if (data.entreprise) {
        this.logger.log(`🏢 [CreateClientUseCase] Création entreprise: ${JSON.stringify(data.entreprise)}`);
        try {
          const entreprise = await this.entrepriseRepository.create({
            nom: data.entreprise.nom,
            siret: data.entreprise.siret,
            adresse: data.entreprise.adresse ? JSON.stringify(data.entreprise.adresse) : null,
            contactEmail: data.entreprise.contactEmail,
            contactTelephone: data.entreprise.contactTelephone,
            dateCreation: new Date(),
          });
          entrepriseId = entreprise.id;
          this.logger.log(`✅ [CreateClientUseCase] Entreprise créée avec ID: ${entrepriseId}`);
        } catch (error) {
          this.logger.error(`❌ [CreateClientUseCase] Erreur création entreprise: ${error.message}`, error.stack);
          throw new Error(`Erreur lors de la création de l'entreprise: ${error.message}`);
        }
      }

      // Création du client
      this.logger.log(`👤 [CreateClientUseCase] Création client en base`);
      const clientData = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone ?? null,
        type: data.type,
        statut: data.statut ?? 'ACTIF',
        tenantId: data.tenantId ?? '',
        proprietaireEntrepriseId: entrepriseId,
      };
      
      this.logger.log(`📝 [CreateClientUseCase] Données client: ${JSON.stringify(clientData)}`);
      
      const client = await this.clientRepository.create(clientData);
      this.logger.log(`✅ [CreateClientUseCase] Client créé avec ID: ${client.id}`);

      // Création de l'adresse si fournie
      if (data.adresse) {
        this.logger.log(`📍 [CreateClientUseCase] Création adresse: ${JSON.stringify(data.adresse)}`);
        try {
          await this.adresseRepository.create({
            clientId: client.id, // Utilise clientId au lieu de utilisateurId
            ...data.adresse,
          });
          this.logger.log(`✅ [CreateClientUseCase] Adresse créée avec succès`);
        } catch (error) {
          this.logger.error(`❌ [CreateClientUseCase] Erreur création adresse: ${error.message}`, error.stack);
          // On ne fait pas échouer la création de client si l'adresse échoue
          this.logger.warn(`⚠️ [CreateClientUseCase] Client créé mais adresse non créée`);
        }
      }

      this.logger.log(`🎉 [CreateClientUseCase] Création client terminée avec succès: ${client.email}`);
      return client;
      
    } catch (error) {
      this.logger.error(`💥 [CreateClientUseCase] Erreur fatale: ${error.message}`, error.stack);
      throw error;
    }
  }
} 