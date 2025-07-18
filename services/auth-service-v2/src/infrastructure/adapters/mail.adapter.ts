import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MailAdapter {
  constructor(
    @Inject('MAILER_SERVICE') private mailerClient: ClientProxy,
  ) {}

  sendInvitation(email: string, activationToken: string, role: string) {
    return this.mailerClient.emit('send_invitation', {
      email,
      activationToken,
      role,
      subject: 'Invitation to join our platform',
      template: 'invitation',
      data: {
        activationLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/activate?token=${activationToken}`,
        role,
      },
    });
  }

  sendPasswordReset(email: string, resetToken: string) {
    return this.mailerClient.emit('send_password_reset', {
      email,
      resetToken,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`,
      },
    });
  }

  sendPasswordExpirationNotice(email: string) {
    return this.mailerClient.emit('send_password_expiration', {
      email,
      subject: 'Your Password Will Expire Soon',
      template: 'password-expiration',
      data: {
        loginLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login`,
      },
    });
  }

  sendRegistrationConfirmation(email: string, firstName: string, lastName: string, activationToken: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://app.aquaerp.cloud';
    return this.mailerClient.emit('user.registered', {
      email,
      firstname: firstName,
      token: activationToken || '',
      frontendUrl: frontendUrl,
    });
  }
}
