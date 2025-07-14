import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { initDatabase, sequelize, models } from '@Database/sequelize';

const logger = new Logger('WorkflowDatabaseModule');

@Module({
  providers: [
    {
      provide: 'SEQUELIZE',
      useValue: { sequelize, models },
    },
  ],
  exports: ['SEQUELIZE'],
})
export class WorkflowDatabaseModule implements OnModuleInit {
  async onModuleInit() {
    try {
      await initDatabase();
      logger.log('✅ Database initialisée pour workflow-service');
    } catch (err) {
      logger.error('❌ Erreur init database', err);
      throw err;
    }
  }
}
