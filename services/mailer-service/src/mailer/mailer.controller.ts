import { Controller, Post, Body } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendMailDto } from './dto/send-mail.dto';

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
}
