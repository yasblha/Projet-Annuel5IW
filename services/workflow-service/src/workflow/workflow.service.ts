import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { v4 as uuid } from 'uuid';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { WorkflowRepository, WorkflowRunRepository } from '@Database/repositories/workflow.repository';

export interface WorkflowDefinition {
  nodes: any[]; // to be refined later
  edges: any[];
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'RUNNING' | 'SUCCESS' | 'ERROR' | 'PAUSED';
  startedAt: Date;
  endedAt?: Date;
  lastNode?: string;
  error?: any;
  context?: any;
  expectedEvent?: string;
}

export interface Workflow {
  id: string;
  name: string;
  definition: WorkflowDefinition;
}

@Injectable()
export class WorkflowService {
  constructor(
    private readonly wfRepo: WorkflowRepository = new WorkflowRepository(),
    private readonly runRepo: WorkflowRunRepository = new WorkflowRunRepository(),
  ) {}

  private readonly logger = new Logger(WorkflowService.name);
  private readonly clients = new Map<string, ClientProxy>();

  private getClient(queue: string): ClientProxy {
    if (!this.clients.has(queue)) {
      const client = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
          queue,
          queueOptions: { durable: true },
        },
      });
      this.clients.set(queue, client);
    }
    return this.clients.get(queue)!;
  }

  async create(dto: CreateWorkflowDto) {
    const wf = await this.wfRepo.create({
      id: uuid(),
      name: dto.name,
      definition: dto.definition,
    });
    return wf;
  }

  findAll() {
    return this.wfRepo.findAll();
  }

  findOne(id: string) {
    return this.wfRepo.findById(id);
  }

  getRuns(workflowId: string) {
    return this.runRepo.findByWorkflow(workflowId);
  }

  /**
   * Very naive executor: if a workflow has a TRIGGER node matching the event, start a run.
   */
  async handleEvent(event: string, payload: any) {
    const wfs = await this.wfRepo.findAll();
    for (const wf of wfs as any[]) {
      const triggerNode = wf.definition?.nodes?.find((n: any) => n.type === 'TRIGGER' && n.event === event);
      if (triggerNode) {
        const run = await this.runRepo.create({
          id: uuid(),
          workflowId: wf.id,
          status: 'RUNNING',
          startedAt: new Date(),
          lastNode: triggerNode.id ?? 'trigger',
          context: payload,
        });
        this.logger.log(`Started run ${run.id} for workflow ${wf.name} on event ${event}`);
        await this.traverse(wf, run, triggerNode, payload, new Set());
      }
    }
  }

  private async traverse(wf: any, run: any, currentNode: any, ctx: any, visited: Set<string>) {
    if (visited.has(currentNode.id)) return;
    visited.add(currentNode.id);

    // For TRIGGER nodes we don't execute anything, just move forward
    if (currentNode.type === 'CONDITION') {
      const result = this.evaluateCondition(currentNode, ctx);
      const label = result ? 'yes' : 'no';
      const edge = wf.definition?.edges?.find((e: any) => e.source === currentNode.id && e.label === label);
      if (!edge) return;
      const nextNode = wf.definition.nodes.find((n: any) => n.id === edge.target);
      if (nextNode) await this.traverse(wf, run, nextNode, ctx, visited);
      return;
    }

    if (currentNode.type === 'WAIT') {
      await this.runRepo.update(run.id, { status: 'PAUSED', expectedEvent: currentNode.event, lastNode: currentNode.id });
      return; // stop traversal until event resumes
    }

    if (currentNode.type === 'ACTION') {
      await this.executeActionNode(wf, run, currentNode, ctx);
    }

    const outgoing = wf.definition?.edges?.filter((e: any) => e.source === currentNode.id) || [];
    for (const edge of outgoing) {
      const nextNode = wf.definition.nodes.find((n: any) => n.id === edge.target);
      if (!nextNode) continue;
      await this.traverse(wf, run, nextNode, ctx, visited);
    }

    // if traversal ended at END node
    if (currentNode.type === 'END') {
      await this.runRepo.update(run.id, { status: 'SUCCESS', endedAt: new Date() });
    }
  }

  private async executeActionNode(wf: any, run: any, node: any, payload: any) {
    try {
      await this.runRepo.update(run.id, { lastNode: node.id });
      const queue = node.queue || `${node.pattern.split('.')[0]}_queue`;
      const client = this.getClient(queue);
      const data = this.renderTemplate(node.payloadTemplate || {}, payload);
      this.logger.log(`Run ${run.id}: sending ${node.pattern} to ${queue}`);
      await client.send(node.pattern, data).toPromise();
    } catch (err) {
      await this.runRepo.update(run.id, {
        status: 'ERROR',
        error: err?.message || err,
        endedAt: new Date(),
      });
      this.logger.error(`Run ${run.id} failed at node ${node.id}`, err);
    }
  }

  private renderTemplate(template: any, ctx: any) {
    // very naive {{var}} replacement
    if (typeof template === 'string') {
      return template.replace(/{{(.*?)}}/g, (_, v) => ctx[v.trim()] ?? '');
    }
    if (Array.isArray(template)) return template.map(v => this.renderTemplate(v, ctx));
    if (typeof template === 'object' && template !== null) {
      const out: any = {};
      for (const k of Object.keys(template)) out[k] = this.renderTemplate(template[k], ctx);
      return out;
    }
    return template;
  }

  private evaluateCondition(node: any, ctx: any): boolean {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const jsonLogic = require('json-logic-js');
      return jsonLogic.apply(node.expression, ctx);
    } catch (err) {
      this.logger.error('Condition evaluation error', err);
      return false;
    }
  }
}
