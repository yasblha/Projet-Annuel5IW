import { Controller, Get, Post, Patch, Param, Body, Query, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('affaires')
@Controller('affaires')
export class AffairesController {
  constructor(@Inject('OPERATION_SERVICE') private readonly service: ClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Créer une affaire' })
  create(@Body() dto: any) {
    return this.send('affaire.create', dto);
  }

  @Patch(':id/validate')
  @ApiOperation({ summary: 'Valider une affaire' })
  validate(@Param('id') id: string, @Body() dto: any) {
    return this.send('affaire.validate', { id, ...dto });
  }

  @Get()
  @ApiOperation({ summary: 'Lister les affaires' })
  list(@Query() query: any) {
    return this.send('affaire.findAll', query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une affaire par ID' })
  findById(@Param('id') id: string) {
    return this.send('affaire.findById', { id });
  }

  private async send(pattern: string, data: any) {
    try {
      return await firstValueFrom(this.service.send(pattern, data));
    } catch (err: any) {
      const status = err.status && err.status >= 100 && err.status <= 599 ? err.status : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(err.message || 'Erreur serveur', status);
    }
  }
}
