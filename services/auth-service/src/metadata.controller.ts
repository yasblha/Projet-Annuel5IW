import { Controller, Get } from '@nestjs/common';

@Controller('metadata')
export class MetadataController {
  @Get()
  getMetadata() {
    return {
      actions: [
        { pattern: 'auth.user.create', queue: 'auth_queue', title: 'Créer utilisateur' },
        { pattern: 'auth.user.resetPwd', queue: 'auth_queue', title: 'Réinitialiser mot de passe' },
      ],
      events: [
        { pattern: 'user.cree', description: 'Utilisateur créé' },
        { pattern: 'pwd.reinitialise', description: 'Mot de passe réinitialisé' },
      ],
    };
  }
}
