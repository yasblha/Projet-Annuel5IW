import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { EventPattern } from '@nestjs/microservices';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  @EventPattern('user.registered')
  async handleUserRegistered(data: { email: string; firstname: string; token: string }) {
    console.log(`📧 Réception événement user.registered pour ${data.email}`);
    
    try {
      await this.sendConfirmationLink({ to: data.email, firstname: data.firstname, token: data.token });
      console.log(`✅ Email d'activation envoyé à ${data.email}`);
    } catch (error) {
      console.error(`❌ Erreur envoi email à ${data.email}:`, error);
    }
  }

  @EventPattern('user.activated')
  async handleUserActivated(data: { email: string; firstname: string }) {
    console.log(`📧 Réception événement user.activated pour ${data.email}`);
    
    try {
      await this.sendConfirmationSuccess({ to: data.email, firstname: data.firstname });
      console.log(`✅ Email de confirmation d'activation envoyé à ${data.email}`);
    } catch (error) {
      console.error(`❌ Erreur envoi email à ${data.email}:`, error);
    }
  }

  @EventPattern('user.invite')
  async handleUserInvite(data: { to: string; firstname: string; token: string }) {
    await this.sendConfirmationLink({ to: data.to, firstname: data.firstname, token: data.token });
  }

  //Email de bienvenue
  async sendWelcomeEmail({ to, name }: SendMailDto): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Bienvenue sur notre plateforme 💧',
      template: 'welcome',
      context: { name },
    });
  }

  // Étape 1 - Inscription reçue
  async sendRegistrationReceivedEmail({ to, firstname }: { to: string; firstname: string }): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Inscription reçue ✅',
      template: 'registration-received',
      context: {
        user: { firstname },
      },
    });
  }

  // Étape 2 - Demande de confirmation avec lien
  async sendConfirmationLink({ to, firstname, token }: { to: string; firstname: string; token: string }): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Confirmation de votre inscription 🔐',
      template: 'registration-link',
              context: {
          user: { firstname },
          confirmationLink: `http://localhost:8080/confirm/${token}`,
        },
    });
  }

  //Étape 3 - Confirmation réussie
  async sendConfirmationSuccess({ to, firstname }: { to: string; firstname: string }): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Compte activé avec succès 🎉',
      template: 'confirmation-mail',
      context: {
        user: { firstname },
      },
    });
  }

  // === Contract Events ===
  
  @EventPattern('contract.created')
  async handleContractCreated(data: { 
    email: string; 
    firstname: string;
    contractId: string;
    contractNumber: string;
  }) {
    console.log(`📧 Réception événement contract.created pour ${data.email}`);
    
    try {
      await this.sendContractCreatedEmail({ 
        to: data.email, 
        firstname: data.firstname,
        contractId: data.contractId,
        contractNumber: data.contractNumber
      });
      console.log(`✅ Email de création de contrat envoyé à ${data.email}`);
    } catch (error) {
      console.error(`❌ Erreur envoi email à ${data.email}:`, error);
    }
  }

  @EventPattern('contract.finalized')
  async handleContractFinalized(data: { 
    email: string; 
    firstname: string;
    contractId: string;
    contractNumber: string;
  }) {
    console.log(`📧 Réception événement contract.finalized pour ${data.email}`);
    
    try {
      await this.sendContractFinalizedEmail({ 
        to: data.email, 
        firstname: data.firstname,
        contractId: data.contractId,
        contractNumber: data.contractNumber
      });
      console.log(`✅ Email de finalisation de contrat envoyé à ${data.email}`);
    } catch (error) {
      console.error(`❌ Erreur envoi email à ${data.email}:`, error);
    }
  }

  @EventPattern('contract.meter.installation')
  async handleMeterInstallation(data: { 
    email: string; 
    firstname: string;
    contractId: string;
    installationDate: string;
  }) {
    console.log(`📧 Réception événement contract.meter.installation pour ${data.email}`);
    
    try {
      await this.sendMeterInstallationEmail({ 
        to: data.email, 
        firstname: data.firstname,
        contractId: data.contractId,
        installationDate: data.installationDate
      });
      console.log(`✅ Email d'installation de compteur envoyé à ${data.email}`);
    } catch (error) {
      console.error(`❌ Erreur envoi email à ${data.email}:`, error);
    }
  }

  @EventPattern('contract.signature.invitation')
  async handleContractSignatureInvitation(data: any) {
    try {
      console.log('Received contract.signature.invitation event with data:', data);

      // URL de base pour le lien de signature
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const templateData = {
        ...data,
        baseUrl: baseUrl,
      };

      await this.mailerService.sendMail({
        to: data.email,
        subject: `Invitation à signer le contrat ${data.contractNumber}`,
        template: 'contract-signature-invitation',
        context: templateData,
      });

      console.log('Contract signature invitation email sent successfully');
    } catch (error) {
      console.error('Error sending contract signature invitation email:', error);
    }
  }

  @EventPattern('contract.signatures.complete')
  async handleContractSignaturesComplete(data: any) {
    try {
      console.log('Received contract.signatures.complete event with data:', data);

      // URL de base pour le lien vers le contrat
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const templateData = {
        ...data,
        baseUrl: baseUrl,
      };

      await this.mailerService.sendMail({
        to: data.email,
        subject: `Toutes les signatures du contrat ${data.contractNumber} sont complétées`,
        template: 'contract-signatures-complete',
        context: templateData,
      });

      console.log('Contract signatures complete email sent successfully');
    } catch (error) {
      console.error('Error sending contract signatures complete email:', error);
    }
  }

  @EventPattern('contract.signature.rejected')
  async handleContractSignatureRejected(data: any) {
    try {
      console.log('Received contract.signature.rejected event with data:', data);

      // URL de base pour le lien vers le contrat
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const templateData = {
        ...data,
        baseUrl: baseUrl,
      };

      await this.mailerService.sendMail({
        to: data.email,
        subject: `Refus de signature pour le contrat ${data.contractNumber}`,
        template: 'contract-signature-rejected',
        context: templateData,
      });

      console.log('Contract signature rejected email sent successfully');
    } catch (error) {
      console.error('Error sending contract signature rejected email:', error);
    }
  }

  // Email templates for contract events
  async sendContractCreatedEmail({ to, firstname, contractId, contractNumber }: { 
    to: string; 
    firstname: string;
    contractId: string;
    contractNumber: string;
  }): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Votre contrat a été créé 📝',
      template: 'welcome', // Fallback to welcome template for now
      context: {
        name: firstname,
        contractNumber,
        contractId,
        dashboardUrl: `http://localhost:8080/contracts/${contractId}`,
      },
    });
  }

  async sendContractFinalizedEmail({ to, firstname, contractId, contractNumber }: { 
    to: string; 
    firstname: string;
    contractId: string;
    contractNumber: string;
  }): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Votre contrat a été finalisé ✅',
      template: 'welcome', // Fallback to welcome template for now
      context: {
        name: firstname,
        contractNumber,
        contractId,
        dashboardUrl: `http://localhost:8080/contracts/${contractId}`,
      },
    });
  }

  async sendMeterInstallationEmail({ to, firstname, contractId, installationDate }: { 
    to: string; 
    firstname: string;
    contractId: string;
    installationDate: string;
  }): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Installation de votre compteur 🔧',
      template: 'welcome', // Fallback to welcome template for now
      context: {
        name: firstname,
        contractId,
        installationDate,
        dashboardUrl: `http://localhost:8080/contracts/${contractId}`,
      },
    });
  }
}
