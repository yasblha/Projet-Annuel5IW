import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { InterventionService } from './intervention.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { FinishInterventionDto } from './dto/finish-intervention.dto';

@Controller('interventions')
export class InterventionController {
  constructor(private readonly service: InterventionService) {}

  @Post()
  create(@Body() dto: CreateInterventionDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/finish')
  finish(@Param('id') id: string, @Body() dto: FinishInterventionDto) {
    return this.service.finish(id, dto);
  }
}
