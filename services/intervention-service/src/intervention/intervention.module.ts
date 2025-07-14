import { Module, Global } from '@nestjs/common';
import { InterventionService } from './intervention.service';
import { InterventionController } from './intervention.controller';
import { InterventionMicroservice } from './intervention.microservice';
import { InterventionRepository } from '@Database/repositories/intervention.repository';

@Global()
@Module({
  providers: [
    InterventionRepository,
    InterventionService,
  ],
  controllers: [InterventionController, InterventionMicroservice],
  exports: [InterventionRepository, InterventionService],
})
export class InterventionModule {}
