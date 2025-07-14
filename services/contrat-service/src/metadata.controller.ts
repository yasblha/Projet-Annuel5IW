import { Controller, Get } from '@nestjs/common';

@Controller('metadata')
export class MetadataController {
  @Get()
  getMetadata() {
    return {
      actions: [
        { pattern: 'contrat.resilier', queue: 'contrat_queue', title: 'Résilier contrat' },
      ],
      events: [
        { pattern: 'contrat.resilie', description: 'Contrat résilié' },
      ],
    };
  }
}
