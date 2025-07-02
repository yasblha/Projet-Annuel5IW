import { Controller, Post, Body } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailerService } from './mailer.service';
import { SendMailDto } from './dto/send-mail.dto';

interface UserRegisteredEvent {
  to: string;
  firstname: string;
  lastname?: string;
  role?: string;
  tenantId?: string;
}

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('welcome')
  async sendWelcomeEmail(@Body() dto: SendMailDto) {
    await this.mailerService.sendWelcomeEmail(dto);
    return { message: 'Email de bienvenue envoyé.' };
  }

  @Post('confirmation-link')
  async sendConfirmationLink(@Body() body: { to: string; firstname: string; token: string }) {
    await this.mailerService.sendConfirmationLink(body);
    return { message: 'Lien de confirmation envoyé.' };
  }

  @Post('registration-confirmed')
  async sendRegistrationConfirm(@Body() body: { to: string; firstname: string; token: string }) {
    await this.mailerService.sendConfirmationSuccess(body);
    return { message: 'Mail de compte confirmé envoyé.' };
  }

  @EventPattern('user.registered')
  async handleUserRegistered(@Payload() data: UserRegisteredEvent) {
    console.log(`📧 Réception événement user.registered pour ${data.to}`);
    
    try {
      await this.mailerService.sendWelcomeEmail({
        to: data.to,
        name: `${data.firstname} ${data.lastname || ''}`.trim(),
        firstname: data.firstname,
        lastname: data.lastname,
        role: data.role,
        tenantId: data.tenantId,
      });
      
      console.log(`✅ Email de bienvenue envoyé à ${data.to}`);
    } catch (error) {
      console.error(`❌ Erreur envoi email à ${data.to}:`, error);
    }
  }
}
