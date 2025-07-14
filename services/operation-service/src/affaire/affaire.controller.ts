import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AffaireService } from './affaire.service';
import { CreateAffaireDto } from './dto/create-affaire.dto';
import { ValidateAffaireDto } from './dto/validate-affaire.dto';

@Controller('affaires')
export class AffaireController {
  constructor(private readonly service: AffaireService) {}

  @Post()
  create(@Body() dto: CreateAffaireDto) {
    return this.service.create(dto);
  }

  @Post(':id/validate')
  validate(@Param('id') id: string, @Body() dto: ValidateAffaireDto) {
    return this.service.validate(id, dto);
  }

  @Get()
  list(@Query('statut') statut?: string) {
    return this.service.list(statut);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.get(id);
  }
}
