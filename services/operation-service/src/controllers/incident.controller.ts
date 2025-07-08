import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    ParseUUIDPipe,
    ParseIntPipe,
    DefaultValuePipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IncidentService } from '../services/incident.service';
import { CreateIncidentDto } from '../dto/create-incident.dto';
import { IncidentStatus, IncidentPriority } from '../entities/incident.entity';

@ApiTags('incidents')
@Controller('incidents')
export class IncidentController {
    constructor(private readonly incidentService: IncidentService) { }

    @Post()
    @ApiOperation({ summary: 'Signaler un nouvel incident' })
    @ApiResponse({ status: 201, description: 'Incident créé avec succès' })
    create(@Body() createIncidentDto: CreateIncidentDto) {
        return this.incidentService.create(createIncidentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lister tous les incidents avec pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        return this.incidentService.findAll(page, limit);
    }

    @Get('open')
    @ApiOperation({ summary: 'Incidents ouverts' })
    getOpenIncidents() {
        return this.incidentService.getOpenIncidents();
    }

    @Get('critical')
    @ApiOperation({ summary: 'Incidents critiques' })
    getCriticalIncidents() {
        return this.incidentService.getCriticalIncidents();
    }

    @Get('stats')
    @ApiOperation({ summary: 'Statistiques des incidents' })
    getStats() {
        return this.incidentService.getIncidentStats();
    }

    @Get('priority/:priority')
    @ApiOperation({ summary: 'Incidents par priorité' })
    getByPriority(@Param('priority') priority: IncidentPriority) {
        return this.incidentService.getIncidentsByPriority(priority);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Détails d\'un incident' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.incidentService.findOne(id);
    }

    @Patch(':id/acknowledge')
    @ApiOperation({ summary: 'Accuser réception d\'un incident' })
    acknowledge(@Param('id', ParseUUIDPipe) id: string) {
        return this.incidentService.acknowledgeIncident(id);
    }

    @Patch(':id/assign')
    @ApiOperation({ summary: 'Assigner un incident' })
    assign(@Param('id', ParseUUIDPipe) id: string) {
        return this.incidentService.assignIncident(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Mettre à jour le statut d\'un incident' })
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { status: IncidentStatus; resolution?: string },
    ) {
        return this.incidentService.updateStatus(id, body.status, body.resolution);
    }
} 