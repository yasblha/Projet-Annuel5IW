import { Controller, Get } from '@nestjs/common';

@Controller('metadata')
export class MetadataController {
  @Get()
  getMetadata() {
    return {
      actions: [
        {
          pattern: 'affaire.create',
          queue: 'operation_queue',
          title: 'Créer affaire',
        },
        {
          pattern: 'affaire.validate',
          queue: 'operation_queue',
          title: 'Valider affaire',
        },
      ],
      events: [
        { pattern: 'affaire.creee', description: 'Affaire créée' },
        { pattern: 'affaire.validee', description: 'Affaire validée' },
      ],
    };
  }
}
