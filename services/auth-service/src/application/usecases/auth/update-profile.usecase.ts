import {User} from "@domain/entité/user";
import { UserRepository} from '@Database/repositories/user.repository';

type UpdateProfileDto = {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string | null;
  role?: 'ADMIN' | 'CLIENT' | 'TECHNICIEN' | 'COMMERCIAL' | 'SUPPORT' | 'COMPTABLE' | 'MANAGER';
  tenantId?: string;
  statut?: 'EN_ATTENTE_VALIDATION' | 'ACTIF' | 'SUSPENDU' | 'BLACKLISTE' | 'ARCHIVE' | 'SUPPRIME';
  isLocked?: boolean;
};

export class UpdateProfileUseCase {

  constructor(private readonly userRepository: UserRepository){}

  public async execute(userId: number, updates: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    console.log('Tentative de mise à jour profile utilisateur', user);

    await this.userRepository.updateProfile({userId : user.id, updates});



    return user;
  }
}