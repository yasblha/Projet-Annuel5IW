import { Controller, Post, Body } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendMailDto } from './dto/send-mail.dto';
import { ConfigService } from '@nestjs/config';

@Controller('mailer')
export class MailerController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  @Post('welcome')
  async sendWelcomeEmail(@Body() dto: SendMailDto) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
    await this.mailerService.sendWelcomeEmail({ ...dto, frontendUrl });
    return { message: 'Email de bienvenue envoyé.' };
  }

  @Post('confirmation-link')
  async sendConfirmationLink(@Body() body: { to: string; firstname: string; token: string }) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
    await this.mailerService.sendConfirmationLink({ ...body, frontendUrl });
    return { message: 'Lien de confirmation envoyé.' };
  }

  @Post('registration-confirmed')
  async sendRegistrationConfirm(@Body() body: { to: string; firstname: string; token: string }) {
    // Pas besoin de frontendUrl pour cette méthode
    await this.mailerService.sendConfirmationSuccess({ 
      to: body.to, 
      firstname: body.firstname 
    });
    return { message: 'Mail de compte confirmé envoyé.' };
  }
}
