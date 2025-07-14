import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
  class Workflow extends Model {
    static associate(models: any) {
      Workflow.hasMany(models.WorkflowNode, { foreignKey: 'workflowId', as: 'nodes' });
      Workflow.hasMany(models.WorkflowEdge, { foreignKey: 'workflowId', as: 'edges' });
      Workflow.hasMany(models.WorkflowRun, { foreignKey: 'workflowId', as: 'runs' });
    }
  }

  Workflow.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    definition: { type: DataTypes.JSONB, allowNull: false },
    published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tenantId: { type: DataTypes.STRING, allowNull: true },
  }, {
    sequelize,
    modelName: 'Workflow',
    tableName: 'workflows',
    timestamps: true,
    createdAt: 'dateCreation',
    updatedAt: 'dateMaj',
  });
  return Workflow;
};
