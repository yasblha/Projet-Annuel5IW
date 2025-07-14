import { Module, Global } from '@nestjs/common';
import { AffaireService } from './affaire.service';
import { AffaireController } from './affaire.controller';
import { AffaireMicroservice } from './affaire.microservice';
import { Affaire } from '@Database/models';

@Global()
@Module({
  providers: [
    {
      provide: 'AFFAIRE_MODEL',
      useValue: Affaire,
    },
    AffaireService,
  ],
  controllers: [AffaireController, AffaireMicroservice],
  exports: ['AFFAIRE_MODEL', AffaireService],
})
export class AffaireModule {}
