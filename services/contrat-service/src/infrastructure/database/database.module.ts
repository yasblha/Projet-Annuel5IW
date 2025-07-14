import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ContratRepository } from '../repositories/contrat.repository';
import { CosignataireRepository } from '../repositories/cosignataire.repository';
import { CompteurRepository } from '../repositories/compteur.repository';
import { ContratAuditRepository } from '@Database/repositories/contrat.repository';
import { initDatabase, sequelize, models } from '@Database/sequelize';

const logger = new Logger('DatabaseModule');

@Module({
  providers: [
    {
      provide: 'SEQUELIZE',
      useValue: { sequelize, models }
    },
    ContratRepository,
    CosignataireRepository,
    CompteurRepository,
    ContratAuditRepository,
  ],
  exports: [
    ContratRepository,
    CosignataireRepository,
    CompteurRepository,
    ContratAuditRepository,
    'SEQUELIZE'
  ],
})
export class DatabaseModule implements OnModuleInit {
  async onModuleInit() {
    try {
      await initDatabase();
      console.log('✅ DatabaseModule: Modèles initialisés avec succès');
      // Afficher la liste des modèles chargés
      console.log('📋 Modèles disponibles:', Object.keys(models).join(', '));
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
      console.error('Détails de l\'erreur:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }
}
