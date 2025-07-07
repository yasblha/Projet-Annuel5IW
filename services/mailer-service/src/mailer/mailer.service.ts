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
}
