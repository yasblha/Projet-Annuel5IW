import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { LotFacturationService } from '../services/lot-facturation.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../infrastructure/guards/tenant.guard';
import { Request } from 'express';
import { CreateLotFacturationDto } from '../dtos/lot-facturation.dto';

@Controller('lots-facturation')
@UseGuards(JwtAuthGuard, TenantGuard)
export class LotFacturationController {
  constructor(private readonly lotFacturationService: LotFacturationService) {}

  /**
   * Crée un nouveau lot de facturation
   * @POST /lots-facturation
   */
  @Post()
  async create(@Body() createLotDto: CreateLotFacturationDto, @Req() request: Request) {
    const context = {
      tenantId: request['tenantId'],
      userId: request.user?.['id'],
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };

    const result = await this.lotFacturationService.create(createLotDto, context);
    return result;
  }

  /**
   * Récupère un lot de facturation par son ID
   * @GET /lots-facturation/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: Request) {
    return this.lotFacturationService.findById(id, request['tenantId']);
  }

  /**
   * Récupère tous les lots de facturation
   * @GET /lots-facturation
   */
  @Get()
  async findAll(@Req() request: Request) {
    return this.lotFacturationService.findAll(request['tenantId']);
  }

  /**
   * Récupère les lots de facturation par période
   * @GET /lots-facturation/periode
   */
  @Get('periode')
  async findByPeriod(
    @Query('mois') mois: number,
    @Query('annee') annee: number,
    @Req() request: Request
  ) {
    if (!mois || !annee) {
      throw new Error('Les paramètres mois et annee sont requis');
    }
    
    return this.lotFacturationService.findByPeriod(
      Number(mois), 
      Number(annee), 
      request['tenantId']
    );
  }
}
