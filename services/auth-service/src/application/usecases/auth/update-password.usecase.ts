import { Inject } from '@nestjs/common';
import { UserRepository } from '@Database/repositories/user.repository';
import {User} from "@domain/entité/user";

export interface UpdatePasswordInput {
  userId: number;
  newHash: string;
}

export class UpdatePasswordUseCase {
  constructor( @Inject('USER_REPOSITORY')  private readonly userRepository: UserRepository,) {}

  public async execute(userId: number, newHash: string): Promise<User> {
    console.log('Tentative de mise à jour mot de passe utilisateur', userId);

    const user = await this.userRepository.findById( userId);
    await this.userRepository.updatePassword( {userId, newHash});

    return user;
  }
}
