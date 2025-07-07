import { UserRepository } from '@Database/repositories/user.repository';
import { ClientProxy } from '@nestjs/microservices';
import { randomBytes } from 'crypto';

export class InviteUserUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerClient: ClientProxy
  ) {}

  async execute(userId: number, invitationTokens: Map<string, string>): Promise<string> {
    const user = await this.userRepository.findById(userId);
    const token = randomBytes(20).toString('hex');
    invitationTokens.set(token, user.id as any);
    this.mailerClient.emit('user.invite', {
      to: user.email,
      firstname: user.prenom,
      token,
    });
    return token;
  }
}