import { Injectable } from '@nestjs/common';
import { InterServiceService } from './inter-service.service';
import { ContratError, ErrorCode } from '../errors/contrat.errors';

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
  tenantId: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly interServiceService: InterServiceService
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

      return {
        type: 'CONTRACT_SIGNED',
        contratId: data.contratId,
        signataireId: data.signataireId,
        emailSent: result.success,
        recipient: signataire.email
      };

    } catch (error) {
      throw new ContratError(
        'Erreur lors de l\'envoi de la notification de signature',
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

  // === NOTIFICATION RAPPEL ===
  async sendReminderNotifications(): Promise<any[]> {
    try {
      // Récupérer les contrats nécessitant des rappels
      const contratsARappeler = await this.interServiceService.getContractsNeedingReminders();
      
      const notifications = [];

      for (const contrat of contratsARappeler) {
        try {
          const proprietaire = await this.interServiceService.getClientInfo(contrat.proprietaireId, contrat.tenantId);
          
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
} 