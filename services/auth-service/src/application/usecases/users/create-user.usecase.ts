import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '@Database/repositories/user.repository';
import { AdresseRepository } from '@Database/repositories/adresse.repository';
import { EntrepriseRepository } from '@Database/repositories/entreprise.repository';
import { ClientProxy } from '@nestjs/microservices';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

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

export interface CreateUserParams {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  statut?: string;
  tenantId?: string;
  adresse?: AdresseParams;
  entreprise?: EntrepriseParams;
  type?: string;
}

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    @Inject('MAILER_SERVICE') private readonly mailerClient: ClientProxy,
    private readonly adresseRepository: AdresseRepository,
    private readonly entrepriseRepository: EntrepriseRepository,
  ) {}

  async execute(data: CreateUserParams) {
    this.logger.log(`🔍 [CreateUserUseCase] Début création utilisateur: ${data.email}`);
    this.logger.log(`📋 [CreateUserUseCase] Données reçues: ${JSON.stringify(data)}`);

    try {
      // Vérifier si l'utilisateur existe déjà
      this.logger.log(`🔍 [CreateUserUseCase] Vérification existence email: ${data.email}`);
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        this.logger.warn(`⚠️ [CreateUserUseCase] Utilisateur déjà existant: ${data.email}`);
        throw new Error(`Un utilisateur avec l'email ${data.email} existe déjà.`);
      }
      this.logger.log(`✅ [CreateUserUseCase] Email disponible`);

      // Vérifier si le téléphone existe déjà (si fourni)
      if (data.telephone) {
        this.logger.log(`🔍 [CreateUserUseCase] Vérification existence téléphone: ${data.telephone}`);
        const existingPhone = await this.userRepository.findByPhone(data.telephone);
        if (existingPhone) {
          this.logger.warn(`⚠️ [CreateUserUseCase] Téléphone déjà existant: ${data.telephone}`);
          throw new Error(`Un utilisateur avec le téléphone ${data.telephone} existe déjà.`);
        }
        this.logger.log(`✅ [CreateUserUseCase] Téléphone disponible`);
      }

      // Génération du token d'invitation et mot de passe temporaire
      this.logger.log(`🔐 [CreateUserUseCase] Génération token d'invitation et mot de passe temporaire`);
      const invitationToken = randomBytes(20).toString('hex');
      const tempPassword = randomBytes(16).toString('hex');
      const hashMotDePasse = await bcrypt.hash(tempPassword, 10);
      
      this.logger.log(`✅ [CreateUserUseCase] Hash généré avec succès`);

      let entrepriseId: string | undefined = undefined;
      
      // Création de l'entreprise si fournie
      if (data.entreprise) {
        this.logger.log(`🏢 [CreateUserUseCase] Création entreprise: ${JSON.stringify(data.entreprise)}`);
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
          this.logger.log(`✅ [CreateUserUseCase] Entreprise créée avec ID: ${entrepriseId}`);
        } catch (error) {
          this.logger.error(`❌ [CreateUserUseCase] Erreur création entreprise: ${error.message}`, error.stack);
          throw new Error(`Erreur lors de la création de l'entreprise: ${error.message}`);
        }
      }

      // Création de l'utilisateur
      this.logger.log(`👤 [CreateUserUseCase] Création utilisateur en base`);
      const userData = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        role: data.role as any,
        telephone: data.telephone ?? null,
        hashMotDePasse,
        tenantId: data.tenantId ?? '',
        statut: (data.statut as ('EN_ATTENTE_VALIDATION' | 'ACTIF' | 'SUSPENDU' | 'BLACKLISTE' | 'ARCHIVE' | 'SUPPRIME')) ?? 'EN_ATTENTE_VALIDATION',
        activationToken: invitationToken,
        proprietaireEntrepriseId: entrepriseId,
      };
      
      this.logger.log(`📝 [CreateUserUseCase] Données utilisateur: ${JSON.stringify(userData)}`);
      
      const user = await this.userRepository.create(userData);
      this.logger.log(`✅ [CreateUserUseCase] Utilisateur créé avec ID: ${user.id}`);

      // Création de l'adresse si fournie
      if (data.adresse) {
        this.logger.log(`📍 [CreateUserUseCase] Création adresse: ${JSON.stringify(data.adresse)}`);
        try {
          await this.adresseRepository.create({
            utilisateurId: user.id,
            ...data.adresse,
          });
          this.logger.log(`✅ [CreateUserUseCase] Adresse créée avec succès`);
        } catch (error) {
          this.logger.error(`❌ [CreateUserUseCase] Erreur création adresse: ${error.message}`, error.stack);
          // On ne fait pas échouer la création d'utilisateur si l'adresse échoue
          this.logger.warn(`⚠️ [CreateUserUseCase] Utilisateur créé mais adresse non créée`);
        }
      }

      // Envoi de l'email d'invitation
      this.logger.log(`📧 [CreateUserUseCase] Envoi email d'invitation à: ${user.email}`);
      try {
        this.mailerClient.emit('user.invite', {
          to: user.email,
          firstname: user.prenom,
          token: invitationToken,
        });
        this.logger.log(`✅ [CreateUserUseCase] Email d'invitation envoyé`);
      } catch (error) {
        this.logger.error(`❌ [CreateUserUseCase] Erreur envoi email: ${error.message}`, error.stack);
        // On ne fait pas échouer la création si l'email échoue
        this.logger.warn(`⚠️ [CreateUserUseCase] Utilisateur créé mais email non envoyé`);
      }

      this.logger.log(`🎉 [CreateUserUseCase] Création utilisateur terminée avec succès: ${user.email}`);
      return user;
      
    } catch (error) {
      this.logger.error(`💥 [CreateUserUseCase] Erreur fatale: ${error.message}`, error.stack);
      throw error;
    }
  }
} 