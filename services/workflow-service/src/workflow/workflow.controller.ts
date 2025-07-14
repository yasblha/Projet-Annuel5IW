import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('workflows')
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly service: WorkflowService) {}

  @Post()
  create(@Body() dto: CreateWorkflowDto) {
    return this.service.create(dto);
  }

  @Get()
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/runs')
  runs(@Param('id') id: string) {
    return this.service.getRuns(id);
  }
}
