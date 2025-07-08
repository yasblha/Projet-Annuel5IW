import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '@domain/entité/user';

@Injectable()
export class AuthService {
  constructor(
    @Inject('MAILER_SERVICE') private readonly mailerClient: ClientProxy,
  ) {}

  async sendWelcomeEmail(user: User) {
    this.mailerClient.emit('user.registered', {
      to: user.email,
      firstname: user.prenom,
      lastname: user.nom,
      role: user.role,
      tenantId: user.tenantId,
    });
    
    console.log(`📧 Événement d'inscription envoyé pour ${user.email}`);
  }
}
