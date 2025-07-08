import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';
import { ClientProxy } from '@nestjs/microservices';

export class ConfirmInvitationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly mailerClient: ClientProxy
  ) {}

  async execute(token: string, password: string, invitationTokens: Map<string, string>): Promise<any> {
    const userId = invitationTokens.get(token);
    if (!userId) {
      throw new Error('Token invalide');
    }
    invitationTokens.delete(token);
    const hash = await this.passwordService.hashPassword(password);
    await this.userRepository.activateUser(Number(userId), hash);
    const user = await this.userRepository.findById(userId as any);
    this.mailerClient.emit('user.registered', {
      email: user.email,
      firstname: user.prenom,
    });
    return user;
  }
}