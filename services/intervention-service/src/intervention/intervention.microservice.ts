import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InterventionService } from './intervention.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { FinishInterventionDto } from './dto/finish-intervention.dto';

@Controller()
export class InterventionMicroservice {
  private readonly logger = new Logger(InterventionMicroservice.name);

  constructor(private readonly service: InterventionService) {}

  @MessagePattern('intervention.create')
  async create(@Payload() data: CreateInterventionDto) {
    this.logger.log(` [intervention.create] reçu: ${JSON.stringify(data)}`);
    return this.service.create(data);
  }

  @MessagePattern('intervention.findAll')
  async findAll(@Payload() filter: any) {
    this.logger.log(` [intervention.findAll] filtre: ${JSON.stringify(filter)}`);
    return this.service.findAll(filter);
  }

  @MessagePattern('intervention.findById')
  async findById(@Payload() data: { id: string }) {
    this.logger.log(` [intervention.findById] id: ${data.id}`);
    return this.service.findById(data.id);
  }

  @MessagePattern('intervention.finish')
  async finish(@Payload() data: { id: string } & FinishInterventionDto) {
    this.logger.log(` [intervention.finish] reçu: ${JSON.stringify(data)}`);
    const { id, ...dto } = data;
    return this.service.finish(id, dto);
  }
}
