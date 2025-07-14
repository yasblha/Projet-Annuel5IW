import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
  class WorkflowEdge extends Model {
    static associate(models: any) {
      WorkflowEdge.belongsTo(models.Workflow, { foreignKey: 'workflowId', as: 'workflow' });
    }
  }

  WorkflowEdge.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    workflowId: { type: DataTypes.UUID, allowNull: false },
    source: { type: DataTypes.UUID, allowNull: false },
    target: { type: DataTypes.UUID, allowNull: false },
    label: { type: DataTypes.STRING, allowNull: true },
  }, {
    sequelize,
    modelName: 'WorkflowEdge',
    tableName: 'workflow_edges',
    timestamps: false,
  });
  return WorkflowEdge;
};
