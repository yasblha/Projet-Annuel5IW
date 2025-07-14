import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
  class WorkflowRun extends Model {
    static associate(models: any) {
      WorkflowRun.belongsTo(models.Workflow, { foreignKey: 'workflowId', as: 'workflow' });
    }
  }

  WorkflowRun.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    workflowId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM('RUNNING', 'PAUSED', 'SUCCESS', 'ERROR'), allowNull: false },
    startedAt: { type: DataTypes.DATE, allowNull: false },
    endedAt: { type: DataTypes.DATE, allowNull: true },
    lastNode: { type: DataTypes.UUID, allowNull: true },
    expectedEvent: { type: DataTypes.STRING, allowNull: true },
    error: { type: DataTypes.TEXT, allowNull: true },
    context: { type: DataTypes.JSONB, allowNull: true },
  }, {
    sequelize,
    modelName: 'WorkflowRun',
    tableName: 'workflow_runs',
    timestamps: false,
  });
  return WorkflowRun;
};
