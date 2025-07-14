import { Module } from '@nestjs/common';
import { FactureRepository } from '@Database/repositories/facture.repository';
import { LigneFactureRepository } from '@Database/repositories/ligneFacture.repository';
import { PaiementRepository } from '@Database/repositories/paiement.repository';
import { LotFacturationRepository } from '@Database/repositories/lotFacturation.repository';

@Module({
  providers: [
    // Enregistrement de tous les repositories de la base de données
    {
      provide: FactureRepository,
      useClass: FactureRepository,
    },
    {
      provide: LigneFactureRepository,
      useClass: LigneFactureRepository,
    },
    {
      provide: PaiementRepository,
      useClass: PaiementRepository,
    },
    {
      provide: LotFacturationRepository,
      useClass: LotFacturationRepository,
    },
  ],
  exports: [
    FactureRepository,
    LigneFactureRepository,
    PaiementRepository,
    LotFacturationRepository,
  ],
})
export class DatabaseModule {}
