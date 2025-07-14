import { Controller, Get } from '@nestjs/common';

@Controller('metadata')
export class MetadataController {
  @Get()
  getMetadata() {
    return {
      actions: [
        {
          pattern: 'intervention.create',
          queue: 'intervention_queue',
          title: 'Créer intervention',
        },
      ],
      events: [
        { pattern: 'intervention.terminee', description: 'Intervention terminée' },
      ],
    };
  }
}
