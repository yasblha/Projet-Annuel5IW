import { Sequelize } from 'sequelize-typescript';
import { WorkflowModel, WorkflowNodeModel, WorkflowEdgeModel, WorkflowRunModel } from './workflow.models';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'postgres',
        port: +(process.env.DB_PORT || 5432),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: process.env.DB_NAME || 'workflow',
        logging: false,
      });
      sequelize.addModels([WorkflowModel, WorkflowNodeModel, WorkflowEdgeModel, WorkflowRunModel]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
