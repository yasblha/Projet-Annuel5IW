import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

@Table({ tableName: 'workflows' })
export class WorkflowModel extends Model<WorkflowModel> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({ allowNull: false })
  name!: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  definition!: object;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  published!: boolean;
}

@Table({ tableName: 'workflow_nodes' })
export class WorkflowNodeModel extends Model<WorkflowNodeModel> {
  @Column({ type: DataType.UUID, primaryKey: true })
  id!: string; // same id as in definition

  @ForeignKey(() => WorkflowModel)
  @Column({ type: DataType.UUID, allowNull: false })
  workflowId!: string;

  @BelongsTo(() => WorkflowModel)
  workflow!: WorkflowModel;

  @Column({ allowNull: false })
  type!: string;

  @Column({ type: DataType.JSONB })
  config!: object;
}

@Table({ tableName: 'workflow_edges' })
export class WorkflowEdgeModel extends Model<WorkflowEdgeModel> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => WorkflowModel)
  @Column({ type: DataType.UUID, allowNull: false })
  workflowId!: string;

  @BelongsTo(() => WorkflowModel)
  workflow!: WorkflowModel;

  @Column({ allowNull: false })
  source!: string;

  @Column({ allowNull: false })
  target!: string;

  @Column({ allowNull: true })
  label?: string;
}

@Table({ tableName: 'workflow_runs' })
export class WorkflowRunModel extends Model<WorkflowRunModel> {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  id!: string;

  @ForeignKey(() => WorkflowModel)
  @Column({ type: DataType.UUID, allowNull: false })
  workflowId!: string;

  @BelongsTo(() => WorkflowModel)
  workflow!: WorkflowModel;

  @Column({ type: DataType.STRING, allowNull: false })
  status!: 'RUNNING' | 'PAUSED' | 'SUCCESS' | 'ERROR';

  @Column({ type: DataType.DATE, allowNull: false })
  startedAt!: Date;

  @Column({ type: DataType.DATE })
  endedAt?: Date;

  @Column({ type: DataType.STRING })
  lastNode?: string;

  @Column({ type: DataType.TEXT })
  error?: string;

  @Column({ type: DataType.JSONB })
  context?: object;

  @Column({ type: DataType.STRING })
  expectedEvent?: string;
}
