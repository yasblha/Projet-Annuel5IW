import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

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
        confirmationLink: `https://votre-app.com/confirm/${token}`,
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
