import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { WorkflowService } from './workflow.service';

@Controller()
export class WorkflowEventListener {
  private readonly logger = new Logger(WorkflowEventListener.name);

  constructor(private readonly service: WorkflowService) {}

  // Wildcard listener on domain_events exchange
  @EventPattern('#')
  async handleDomainEvent(@Payload() data: any) {
    // data should contain { pattern, payload }
    const { pattern, payload } = data;
    this.logger.debug(`Received event ${pattern}`);
    await this.handleMessage(pattern, payload);
  }

  async handleMessage(event: string, payload: any) {
    // resume paused runs first
    const pausedRuns = await (this.service as any).runRepo.findPausedByEvent(event);
    for (const run of pausedRuns) {
      const wf = await this.service.findOne(run.workflowId);
      if (!wf) continue;
      const lastNode = wf.definition.nodes.find((n: any) => n.id === run.lastNode);
      await (this.service as any).runRepo.update(run.id, { status: 'RUNNING', expectedEvent: null });
      await (this.service as any).traverse(wf, run, lastNode, payload, new Set());
    }

    await this.service.handleEvent(event, payload);
  }
}
