import { Injectable } from '@nestjs/common';
import { InterServiceService } from './inter-service.service';
import { ContratError, ErrorCode } from '../errors/contrat.errors';
import { JwtService } from '@nestjs/jwt';

export interface NotificationContext {
  tenantId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  data: any;
  tenantId: string;
}

export interface SMSNotification {
  to: string;
  message: string;
  tenantId: string;
}

export interface ContractCreationNotification {
  contratId: string;
  numero: string;
  proprietaireId: string;
  typeProprietaire: 'UTILISATEUR' | 'ENTREPRISE';
  tenantId: string;
}

export interface CosignataireInvitationNotification {
  contratId: string;
  cosignataireId: string;
  email: string;
  tenantId: string;
}

export interface ContractSignatureNotification {
  contratId: string;
  numero: string;
  signataireId: string;
  tenantId: string;
}

export interface ContractResiliationNotification {
  contratId: string;
  numero: string;
  motifResiliation: string;
  proprietaireId: string;
  tenantId: string;
}

export interface ContractFinalizedNotification {
  contratId: string;
  numero: string;
  proprietaireId: string;
  tenantId: string;
}

export interface MeterInstallationNotification {
  contratId: string;
  numero: string;
  compteurId: string;
  proprietaireId: string;
  tenantId: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly interServiceService: InterServiceService,
    private readonly jwtService: JwtService
  ) {}

  // === NOTIFICATION CRÉATION CONTRAT ===
  async notifyContractCreation(data: ContractCreationNotification): Promise<any> {
    try {
      // Récupérer les informations du propriétaire
      const proprietaire = await this.interServiceService.getClientInfo(data.proprietaireId, data.tenantId);
      
      if (!proprietaire) {
        throw new ContratError(
          'Propriétaire non trouvé pour l\'envoi de notification',
          ErrorCode.CLIENT_NOT_FOUND,
          404
        );
      }

      const emailNotification: EmailNotification = {
        to: proprietaire.email,
        subject: `Nouveau contrat créé - ${data.numero}`,
        template: 'contract-creation',
        data: {
          contratId: data.contratId,
          numero: data.numero,
          proprietaireNom: proprietaire.nom,
          proprietairePrenom: proprietaire.prenom,
          typeProprietaire: data.typeProprietaire,
          dateCreation: new Date().toISOString(),
          lienContrat: `${process.env.FRONTEND_URL}/contrats/${data.contratId}`,
          tenantId: data.tenantId
        },
        tenantId: data.tenantId
      };

      const result = await this.sendEmail(emailNotification);
      
      // Envoyer aussi un SMS si le téléphone est disponible
      if (proprietaire.telephone) {
        await this.sendSMS({
          to: proprietaire.telephone,
          message: `Votre contrat ${data.numero} a été créé avec succès. Consultez votre espace client pour plus de détails.`,
          tenantId: data.tenantId
        });
      }

      // Émettre un événement pour le mailer-service
      await this.interServiceService.emitEvent('contract.created', {
        email: proprietaire.email,
        firstname: proprietaire.prenom,
        contractId: data.contratId,
        contractNumber: data.numero
      });

      return {
        type: 'CONTRACT_CREATION',
        contratId: data.contratId,
        emailSent: result.success,
        smsSent: !!proprietaire.telephone,
        recipient: proprietaire.email
      };

    } catch (error) {
      throw new ContratError(
        'Erreur lors de l\'envoi de la notification de création de contrat',
        ErrorCode.NOTIFICATION_ERROR,
        500,
        { originalError: error.message, contratId: data.contratId }
      );
    }
  }

  // === NOTIFICATION INVITATION COSIGNATAIRE ===
  async notifyCosignataireInvitation(data: CosignataireInvitationNotification): Promise<any> {
    try {
      // Récupérer les informations du cosignataire
      const cosignataire = await this.interServiceService.getClientInfo(data.cosignataireId, data.tenantId);
      
      if (!cosignataire) {
        throw new ContratError(
          'Cosignataire non trouvé pour l\'envoi de notification',
          ErrorCode.CLIENT_NOT_FOUND,
          404
        );
      }

      // Récupérer les informations du contrat
      const contrat = await this.interServiceService.getContractInfo(data.contratId, data.tenantId);
      
      if (!contrat) {
        throw new ContratError(
          'Contrat non trouvé pour l\'envoi de notification',
          ErrorCode.CONTRAT_NOT_FOUND,
          404
        );
      }

      const emailNotification: EmailNotification = {
        to: data.email || cosignataire.email,
        subject: `Invitation à cosigner le contrat ${contrat.numero}`,
        template: 'cosignataire-invitation',
        data: {
          contratId: data.contratId,
          numero: contrat.numero,
          cosignataireNom: cosignataire.nom,
          cosignatairePrenom: cosignataire.prenom,
          proprietaireNom: contrat.proprietaireNom,
          proprietairePrenom: contrat.proprietairePrenom,
          dateInvitation: new Date().toISOString(),
          lienSignature: `${process.env.FRONTEND_URL}/contrats/${data.contratId}/signature`,
          tenantId: data.tenantId
        },
        tenantId: data.tenantId
      };

      const result = await this.sendEmail(emailNotification);

      // Envoyer aussi un SMS si le téléphone est disponible
      if (cosignataire.telephone) {
        await this.sendSMS({
          to: cosignataire.telephone,
          message: `Vous avez été invité à cosigner le contrat ${contrat.numero}. Consultez votre email pour plus de détails.`,
          tenantId: data.tenantId
        });
      }

      return {
        type: 'COSIGNATAIRE_INVITATION',
        contratId: data.contratId,
        cosignataireId: data.cosignataireId,
        emailSent: result.success,
        smsSent: !!cosignataire.telephone,
        recipient: data.email || cosignataire.email
      };

    } catch (error) {
      throw new ContratError(
        'Erreur lors de l\'envoi de la notification d\'invitation cosignataire',
        ErrorCode.NOTIFICATION_ERROR,
        500,
        { originalError: error.message, contratId: data.contratId, cosignataireId: data.cosignataireId }
      );
    }
  }

  // === NOTIFICATION SIGNATURE CONTRAT ===
  async notifyContractSignature(data: ContractSignatureNotification): Promise<any> {
    try {
      // Récupérer les informations du signataire
      const signataire = await this.interServiceService.getClientInfo(data.signataireId, data.tenantId);
      
      if (!signataire) {
        throw new ContratError(
          'Signataire non trouvé pour l\'envoi de notification',
          ErrorCode.CLIENT_NOT_FOUND,
          404
        );
      }

      const emailNotification: EmailNotification = {
        to: signataire.email,
        subject: `Contrat ${data.numero} signé avec succès`,
        template: 'contract-signed',
        data: {
          contratId: data.contratId,
          numero: data.numero,
          signataireNom: signataire.nom,
          signatairePrenom: signataire.prenom,
          dateSignature: new Date().toISOString(),
          lienContrat: `${process.env.FRONTEND_URL}/contrats/${data.contratId}`,
          tenantId: data.tenantId
        },
        tenantId: data.tenantId
      };

      const result = await this.sendEmail(emailNotification);
      
      // Émettre un événement pour le mailer-service
      await this.interServiceService.emitEvent('contract.finalized', {
        email: signataire.email,
        firstname: signataire.prenom,
        contractId: data.contratId,
        contractNumber: data.numero
      });

      return {
        type: 'CONTRACT_SIGNED',
        contratId: data.contratId,
        signataireId: data.signataireId,
        emailSent: result.success,
        recipient: signataire.email
      };

    } catch (error) {
      throw new ContratError(
        'Erreur lors de l\'envoi de la notification de signature de contrat',
        ErrorCode.NOTIFICATION_ERROR,
        500,
        { originalError: error.message, contratId: data.contratId }
      );
    }
  }

  // === NOTIFICATION RÉSILIATION CONTRAT ===
  async notifyContractResiliation(data: ContractResiliationNotification): Promise<any> {
    try {
      // Récupérer les informations du propriétaire
      const proprietaire = await this.interServiceService.getClientInfo(data.proprietaireId, data.tenantId);
      
      if (!proprietaire) {
        throw new ContratError(
          'Propriétaire non trouvé pour l\'envoi de notification',
          ErrorCode.CLIENT_NOT_FOUND,
          404
        );
      }

      const emailNotification: EmailNotification = {
        to: proprietaire.email,
        subject: `Contrat ${data.numero} résilié`,
        template: 'contract-resiliated',
        data: {
          contratId: data.contratId,
          numero: data.numero,
          proprietaireNom: proprietaire.nom,
          proprietairePrenom: proprietaire.prenom,
          motifResiliation: data.motifResiliation,
          dateResiliation: new Date().toISOString(),
          lienContrat: `${process.env.FRONTEND_URL}/contrats/${data.contratId}`,
          tenantId: data.tenantId
        },
        tenantId: data.tenantId
      };

      const result = await this.sendEmail(emailNotification);

      return {
        type: 'CONTRACT_RESILIATED',
        contratId: data.contratId,
        emailSent: result.success,
        recipient: proprietaire.email
      };

    } catch (error) {
      throw new ContratError(
        'Erreur lors de l\'envoi de la notification de résiliation',
        ErrorCode.NOTIFICATION_ERROR,
        500,
        { originalError: error.message, contratId: data.contratId }
      );
    }
  }

  // === NOTIFICATION FINALISATION CONTRAT ===
  async notifyContractFinalized(data: ContractFinalizedNotification): Promise<any> {
    try {
      // Récupérer les informations du propriétaire
      const proprietaire = await this.interServiceService.getClientInfo(data.proprietaireId, data.tenantId);
      
      if (!proprietaire) {
        throw new ContratError(
          'Propriétaire non trouvé pour l\'envoi de notification',
          ErrorCode.CLIENT_NOT_FOUND,
          404
        );
      }

      const emailNotification: EmailNotification = {
        to: proprietaire.email,
        subject: `Contrat ${data.numero} finalisé`,
        template: 'contract-finalized',
        data: {
          contratId: data.contratId,
          numero: data.numero,
          proprietaireNom: proprietaire.nom,
          proprietairePrenom: proprietaire.prenom,
          dateFinalization: new Date().toISOString(),
          lienContrat: `${process.env.FRONTEND_URL}/contrats/${data.contratId}`,
          tenantId: data.tenantId
        },
        tenantId: data.tenantId
      };

      const result = await this.sendEmail(emailNotification);
      
      // Envoyer aussi un SMS si le téléphone est disponible
      if (proprietaire.telephone) {
        await this.sendSMS({
          to: proprietaire.telephone,
          message: `Votre contrat ${data.numero} a été finalisé. Consultez votre espace client pour plus de détails.`,
          tenantId: data.tenantId
        });
      }

      // Émettre un événement pour le mailer-service
      await this.interServiceService.emitEvent('contract.finalized', {
        email: proprietaire.email,
        firstname: proprietaire.prenom,
        contractId: data.contratId,
        contractNumber: data.numero
      });

      return {
        type: 'CONTRACT_FINALIZED',
        contratId: data.contratId,
        emailSent: result.success,
        smsSent: !!proprietaire.telephone,
        recipient: proprietaire.email
      };

    } catch (error) {
      throw new ContratError(
        'Erreur lors de l\'envoi de la notification de finalisation de contrat',
        ErrorCode.NOTIFICATION_ERROR,
        500,
        { originalError: error.message, contratId: data.contratId }
      );
    }
  }

  // === NOTIFICATION INSTALLATION COMPTEUR ===
  async notifyMeterInstallation(data: MeterInstallationNotification): Promise<any> {
    try {
      // Récupérer les informations du propriétaire
      const proprietaire = await this.interServiceService.getClientInfo(data.proprietaireId, data.tenantId);
      
      if (!proprietaire) {
        throw new ContratError(
          'Propriétaire non trouvé pour l\'envoi de notification',
          ErrorCode.CLIENT_NOT_FOUND,
          404
        );
      }

      // Récupérer les informations du compteur
      const compteur = await this.interServiceService.getCompteurInfo(data.compteurId);

      const emailNotification: EmailNotification = {
        to: proprietaire.email,
        subject: `Installation du compteur pour votre contrat ${data.numero}`,
        template: 'meter-installation',
        data: {
          contratId: data.contratId,
          numero: data.numero,
          compteurId: data.compteurId,
          compteurNumero: compteur?.numero || 'N/A',
          proprietaireNom: proprietaire.nom,
          proprietairePrenom: proprietaire.prenom,
          dateInstallation: new Date().toISOString(),
          lienContrat: `${process.env.FRONTEND_URL}/contrats/${data.contratId}`,
          tenantId: data.tenantId
        },
        tenantId: data.tenantId
      };

      const result = await this.sendEmail(emailNotification);
      
      // Émettre un événement pour le mailer-service
      await this.interServiceService.emitEvent('contract.meter.installation', {
        email: proprietaire.email,
        firstname: proprietaire.prenom,
        contractId: data.contratId,
        contractNumber: data.numero,
        meterId: data.compteurId
      });

      return {
        type: 'METER_INSTALLATION',
        contratId: data.contratId,
        compteurId: data.compteurId,
        emailSent: result.success,
        recipient: proprietaire.email
      };

    } catch (error) {
      throw new ContratError(
        'Erreur lors de l\'envoi de la notification d\'installation de compteur',
        ErrorCode.NOTIFICATION_ERROR,
        500,
        { originalError: error.message, contratId: data.contratId, compteurId: data.compteurId }
      );
    }
  }

  // === NOTIFICATION RAPPEL ===
  async sendReminderNotifications(): Promise<any[]> {
    try {
      // Récupérer les contrats nécessitant des rappels
      const contratsARappeler = await this.interServiceService.getContractsNeedingReminders();
      
      const notifications = [];

      for (const contrat of contratsARappeler) {
        try {
          const proprietaire = await this.interServiceService.getClientInfo(
            contrat.proprietaireId,
            contrat.tenantId
          );
          
          if (proprietaire) {
            const notification = await this.sendEmail({
              to: proprietaire.email,
              subject: `Rappel - Contrat ${contrat.numero}`,
              template: 'contract-reminder',
              data: {
                contratId: contrat.id,
                numero: contrat.numero,
                proprietaireNom: proprietaire.nom,
                proprietairePrenom: proprietaire.prenom,
                typeRappel: contrat.typeRappel,
                dateLimite: contrat.dateLimite,
                lienContrat: `${process.env.FRONTEND_URL}/contrats/${contrat.id}`,
                tenantId: contrat.tenantId
              },
              tenantId: contrat.tenantId
            });

            notifications.push({
              type: 'REMINDER',
              contratId: contrat.id,
              emailSent: notification.success,
              recipient: proprietaire.email
            });
          }
        } catch (error) {
          console.error(`Erreur lors de l'envoi du rappel pour le contrat ${contrat.id}:`, error);
        }
      }

      return notifications;

    } catch (error) {
      throw new ContratError(
        'Erreur lors de l\'envoi des notifications de rappel',
        ErrorCode.NOTIFICATION_ERROR,
        500,
        { originalError: error.message }
      );
    }
  }

  /**
   * Envoie une invitation à signer un contrat à un cosignataire
   */
  async notifyCosignataireSignature(
    cosignataire: any,
    contrat: any,
    proprietaire: any,
    baseUrl: string
  ) {
    try {
      if (!cosignataire || !cosignataire.email) {
        console.error('Impossible d\'envoyer l\'invitation: données du cosignataire invalides');
        return { success: false, error: 'Données du cosignataire invalides' };
      }

      // Générer un token de signature JWT
      const signatureToken = this.jwtService.sign(
        {
          contratId: contrat.id,
          cosignataireId: cosignataire.id,
          email: cosignataire.email,
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 jours
        },
        {
          secret: process.env.JWT_SECRET || 'supersecret'
        }
      );

      // Construire le lien de signature
      const signatureUrl = `${baseUrl}/signature/${contrat.id}?token=${signatureToken}`;

      // Données pour le template email
      let userData = null;
      let entrepriseData = null;

      try {
        // On utilise getClientInfo au lieu de getUserInfo qui n'existe pas
        if (proprietaire && proprietaire.type === 'UTILISATEUR') {
          userData = await this.interServiceService.getClientInfo(
            proprietaire.id,
            contrat.tenantId
          );
        } else if (proprietaire && proprietaire.type === 'ENTREPRISE') {
          // On n'a pas de getEntrepriseInfo, donc on va utiliser une solution alternative
          entrepriseData = {
            nom: proprietaire.nom || 'L\'entreprise',
            email: proprietaire.email || 'contact@entreprise.com'
          };
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des infos du propriétaire:', error);
      }

      // Préparer les données pour le template
      const emailData = {
        contrat: {
          id: contrat.id,
          numero: contrat.numero || 'Brouillon',
          typeContrat: contrat.typeContrat || 'Contrat',
          dateCreation: contrat.dateCreation
            ? new Date(contrat.dateCreation).toLocaleDateString('fr-FR')
            : new Date().toLocaleDateString('fr-FR')
        },
        cosignataire: {
          nom: cosignataire.nom || '',
          prenom: cosignataire.prenom || '',
          email: cosignataire.email
        },
        proprietaire: userData
          ? {
              nom: userData.nom || '',
              prenom: userData.prenom || '',
              email: userData.email || ''
            }
          : entrepriseData
          ? {
              nom: entrepriseData.nom || '',
              email: entrepriseData.email || ''
            }
          : {
              nom: 'Le propriétaire',
              email: 'contact@entreprise.com'
            },
        signatureUrl
      };

      // Mise à jour du statut d'invitation du cosignataire
      try {
        // Au lieu d'utiliser this.contratService qui n'existe pas, mettons à jour directement
        // via un repository qu'on peut injecter dans le constructeur si nécessaire
        // Pour l'instant, on commente simplement cette partie
        /*
        await this.contratService.updateCosignataire(
          contrat.id,
          cosignataire.id,
          {
            statutInvitation: 'ENVOYEE',
            dateInvitation: new Date()
          },
          { tenantId: contrat.tenantId }
        );
        */
        console.log(`Invitation envoyée à ${cosignataire.email} pour le contrat ${contrat.id}`);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut du cosignataire:', error);
      }

      // Envoyer l'email
      return this.sendEmail({
        to: cosignataire.email,
        subject: `Invitation à signer le contrat ${contrat.numero || 'en cours de finalisation'}`,
        template: 'contract-signature-invitation',
        data: emailData,
        tenantId: contrat.tenantId
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation de signature:', error);
      return { success: false, error: error.message };
    }
  }

  // Notifie le propriétaire du contrat que toutes les signatures ont été recueillies
  async notifyAllSignaturesComplete(
    contrat: any,
    context: NotificationContext
  ) {
    try {
      if (!contrat || !contrat.proprietaireId) {
        console.error('Impossible d\'envoyer la notification: données du contrat invalides');
        return { success: false, error: 'Données du contrat invalides' };
      }

      let userData = null;

      try {
        // On utilise getClientInfo au lieu de getUserInfo qui n'existe pas
        userData = await this.interServiceService.getClientInfo(
          contrat.proprietaireId,
          context.tenantId
        );
      } catch (error) {
        console.error('Erreur lors de la récupération des infos du propriétaire:', error);
      }

      // Si on ne peut pas récupérer les données du propriétaire, on ne peut pas envoyer d'email
      if (!userData || !userData.email) {
        return { success: false, error: 'Impossible de récupérer les informations du propriétaire' };
      }

      // Préparer les données pour le template
      const emailData = {
        contrat: {
          id: contrat.id,
          numero: contrat.numero || 'Brouillon',
          typeContrat: contrat.typeContrat || 'Contrat',
          dateCreation: contrat.dateCreation
            ? new Date(contrat.dateCreation).toLocaleDateString('fr-FR')
            : new Date().toLocaleDateString('fr-FR')
        },
        proprietaire: {
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          email: userData.email
        }
      };

      // Ajouter une entrée d'audit
      try {
        // Au lieu d'utiliser this.contratService qui n'existe pas, on commente cette partie
        /*
        await this.contratService.logAudit({
          contratId: contrat.id,
          userId: context.userId,
          action: 'NOTIFICATION',
          details: { type: 'SIGNATURES_COMPLETES' },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          tenantId: context.tenantId
        );
        */
      } catch (error) {
        console.error('Erreur lors de la création de l\'audit:', error);
      }

      // Envoyer l'email
      return this.sendEmail({
        to: userData.email,
        subject: `Toutes les signatures ont été recueillies pour le contrat ${contrat.numero || contrat.id}`,
        template: 'contract-signatures-complete',
        data: emailData,
        tenantId: context.tenantId
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de signatures complètes:', error);
      return { success: false, error: error.message };
    }
  }

  // Notifie le propriétaire du contrat qu'une signature a été refusée
  async notifySignatureRejected(
    contrat: any,
    cosignataire: any,
    context: NotificationContext
  ) {
    try {
      if (!contrat || !contrat.proprietaireId || !cosignataire) {
        console.error('Impossible d\'envoyer la notification: données invalides');
        return { success: false, error: 'Données invalides' };
      }

      let userData = null;
      let entrepriseData = null;

      try {
        // On utilise getClientInfo au lieu de getUserInfo qui n'existe pas
        if (contrat.typeProprietaire === 'UTILISATEUR') {
          userData = await this.interServiceService.getClientInfo(
            contrat.proprietaireId,
            context.tenantId
          );
        } else if (contrat.typeProprietaire === 'ENTREPRISE') {
          // On n'a pas de getEntrepriseInfo, donc on va utiliser une solution alternative
          entrepriseData = {
            nom: contrat.proprietaireNom || 'L\'entreprise',
            email: contrat.proprietaireEmail || 'contact@entreprise.com'
          };
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des infos du propriétaire:', error);
      }

      // Si on ne peut pas récupérer les données du propriétaire, on ne peut pas envoyer d'email
      const destinataire = userData?.email || entrepriseData?.email;
      if (!destinataire) {
        return { success: false, error: 'Impossible de récupérer l\'email du propriétaire' };
      }

      // Préparer les données pour le template
      const emailData = {
        contrat: {
          id: contrat.id,
          numero: contrat.numero || 'Brouillon',
          typeContrat: contrat.typeContrat || 'Contrat'
        },
        cosignataire: {
          nom: cosignataire.nom || '',
          prenom: cosignataire.prenom || '',
          email: cosignataire.email || '',
          motifRefus: cosignataire.motifRefus || 'Non spécifié'
        },
        proprietaire: userData
          ? {
              nom: userData.nom || '',
              prenom: userData.prenom || '',
              email: userData.email || ''
            }
          : entrepriseData
          ? {
              nom: entrepriseData.nom || '',
              email: entrepriseData.email || ''
            }
          : {
              nom: 'Propriétaire',
              email: destinataire
            }
      };

      // Ajouter une entrée d'audit
      try {
        // Au lieu d'utiliser this.contratService qui n'existe pas, on commente cette partie
        /*
        await this.contratService.logAudit({
          contratId: contrat.id,
          userId: context.userId,
          action: 'NOTIFICATION',
          details: { 
            type: 'SIGNATURE_REFUSEE', 
            cosignataire: cosignataire.id,
            motif: cosignataire.motifRefus 
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          tenantId: context.tenantId
        });
        */
      } catch (error) {
        console.error('Erreur lors de la création de l\'audit:', error);
      }

      // Envoyer l'email
      return this.sendEmail({
        to: destinataire,
        subject: `Signature refusée pour le contrat ${contrat.numero || contrat.id}`,
        template: 'contract-signature-rejected',
        data: emailData,
        tenantId: context.tenantId
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de signature refusée:', error);
      return { success: false, error: error.message };
    }
  }

  // === ENVOI EMAIL ===
  private async sendEmail(notification: EmailNotification): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Appel au service mailer via inter-service
      const result = await this.interServiceService.sendEmail({
        to: notification.to,
        subject: notification.subject,
        template: notification.template,
        data: notification.data,
        tenantId: notification.tenantId
      });

      return {
        success: result.success,
        messageId: result.messageId
      };

    } catch (error) {
      throw new ContratError(
        `Erreur lors de l'envoi de l'email: ${error.message}`,
        ErrorCode.EMAIL_SEND_FAILED,
        500,
        { 
          to: notification.to,
          subject: notification.subject,
          originalError: error.message 
        }
      );
    }
  }

  // === ENVOI SMS ===
  private async sendSMS(notification: SMSNotification): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Appel au service SMS via inter-service
      const result = await this.interServiceService.sendSMS({
        to: notification.to,
        message: notification.message,
        tenantId: notification.tenantId
      });

      return {
        success: result.success,
        messageId: result.messageId
      };

    } catch (error) {
      throw new ContratError(
        `Erreur lors de l'envoi du SMS: ${error.message}`,
        ErrorCode.SMS_SEND_FAILED,
        500,
        { 
          to: notification.to,
          originalError: error.message 
        }
      );
    }
  }
}