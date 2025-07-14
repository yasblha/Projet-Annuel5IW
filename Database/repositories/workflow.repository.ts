import { models } from '../sequelize';

const { Workflow, WorkflowNode, WorkflowEdge, WorkflowRun } = models;

export class WorkflowRepository {
  async create(data: any) {
    return Workflow.create(data);
  }
  async findAll(options?: any) {
    return Workflow.findAll(options);
  }
  async findById(id: string) {
    return Workflow.findByPk(id);
  }
  async update(id: string, data: any) {
    return Workflow.update(data, { where: { id } });
  }
  async delete(id: string) {
    return Workflow.destroy({ where: { id } });
  }
}

export class WorkflowRunRepository {
  async create(data: any) {
    return WorkflowRun.create(data);
  }
  async update(id: string, data: any) {
    return WorkflowRun.update(data, { where: { id } });
  }
  async findById(id: string) {
    return WorkflowRun.findByPk(id);
  }
  async findByWorkflow(workflowId: string) {
    return WorkflowRun.findAll({ where: { workflowId }, order: [['startedAt', 'DESC']] });
  }
  async findPausedByEvent(event: string) {
    return WorkflowRun.findAll({ where: { status: 'PAUSED', expectedEvent: event } });
  }
}
