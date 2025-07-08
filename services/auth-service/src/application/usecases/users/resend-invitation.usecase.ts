import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@Database/repositories/user.repository';
import { ClientProxy } from '@nestjs/microservices';
import { randomBytes } from 'crypto';

@Injectable()
export class ResendInvitationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('MAILER_SERVICE') private readonly mailerClient: ClientProxy
  ) {}

  async execute(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('Utilisateur non trouvé');
    const invitationToken = randomBytes(20).toString('hex');
    await this.userRepository.update(id, { activationToken: invitationToken });
    this.mailerClient.emit('user.invite', {
      to: user.email,
      firstname: user.prenom,
      token: invitationToken,
    });
    return { success: true };
  }
} 