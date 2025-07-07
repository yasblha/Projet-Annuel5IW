import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@Database/repositories/user.repository';
import { ClientProxy } from '@nestjs/microservices';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface CreateUserParams {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('MAILER_SERVICE') private readonly mailerClient: ClientProxy
  ) {}

  async execute(data: CreateUserParams) {
    const invitationToken = randomBytes(20).toString('hex');
    const tempPassword = randomBytes(16).toString('hex');
    const hashMotDePasse = await bcrypt.hash(tempPassword, 10);
    const user = await this.userRepository.create({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      role: data.role as any,
      telephone: data.telephone ?? null,
      hashMotDePasse,
      tenantId: '',
      statut: 'EN_ATTENTE_VALIDATION',
      activationToken: invitationToken,
    });
    this.mailerClient.emit('user.invite', {
      to: user.email,
      firstname: user.prenom,
      token: invitationToken,
    });
    return user;
  }
} 