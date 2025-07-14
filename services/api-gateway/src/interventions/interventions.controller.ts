import { Controller, Get, Post, Patch, Body, Param, Query, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('interventions')
@Controller('interventions')
export class InterventionsController {
  constructor(@Inject('INTERVENTION_SERVICE') private readonly service: ClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Créer une intervention' })
  async create(@Body() body: any) {
    return this.handle('intervention.create', body);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les interventions' })
  async findAll(@Query() query: any) {
    return this.handle('intervention.findAll', query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une intervention par ID' })
  async findById(@Param('id') id: string) {
    return this.handle('intervention.findById', { id });
  }

  @Patch(':id/finish')
  @ApiOperation({ summary: 'Terminer une intervention' })
  async finish(@Param('id') id: string, @Body() dto: any) {
    return this.handle('intervention.finish', { id, ...dto });
  }

  private async handle(pattern: string, data: any) {
    try {
      return await firstValueFrom(this.service.send(pattern, data));
    } catch (err: any) {
      const status = err.status && err.status >= 100 && err.status <= 599 ? err.status : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(err.message || 'Erreur serveur', status);
    }
  }
}
