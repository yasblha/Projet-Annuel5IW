import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
  class WorkflowNode extends Model {
    static associate(models: any) {
      WorkflowNode.belongsTo(models.Workflow, { foreignKey: 'workflowId', as: 'workflow' });
    }
  }

  WorkflowNode.init({
    id: { type: DataTypes.UUID, primaryKey: true },
    workflowId: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    config: { type: DataTypes.JSONB, allowNull: true },
  }, {
    sequelize,
    modelName: 'WorkflowNode',
    tableName: 'workflow_nodes',
    timestamps: false,
  });
  return WorkflowNode;
};
