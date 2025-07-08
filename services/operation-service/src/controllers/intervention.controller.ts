import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseUUIDPipe,
    ParseIntPipe,
    DefaultValuePipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InterventionService } from '../services/intervention.service';
import { CreateInterventionDto } from '../dto/create-intervention.dto';
import { UpdateInterventionDto } from '../dto/update-intervention.dto';
import { InterventionStatus } from '../entities/intervention.entity';

@ApiTags('interventions')
@Controller('interventions')
export class InterventionController {
    constructor(private readonly interventionService: InterventionService) { }

    @Post()
    @ApiOperation({ summary: 'Créer une nouvelle intervention' })
    @ApiResponse({ status: 201, description: 'Intervention créée avec succès' })
    create(@Body() createInterventionDto: CreateInterventionDto) {
        return this.interventionService.create(createInterventionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lister toutes les interventions avec pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        return this.interventionService.findAll(page, limit);
    }

    @Get('calendar')
    @ApiOperation({ summary: 'Vue calendrier des interventions' })
    @ApiQuery({ name: 'start', required: true, type: String, description: 'Date de début (YYYY-MM-DD)' })
    @ApiQuery({ name: 'end', required: true, type: String, description: 'Date de fin (YYYY-MM-DD)' })
    getCalendarView(
        @Query('start') startDate: string,
        @Query('end') endDate: string,
    ) {
        return this.interventionService.getCalendarView(
            new Date(startDate),
            new Date(endDate)
        );
    }

    @Get('urgent')
    @ApiOperation({ summary: 'Interventions urgentes' })
    getUrgentInterventions() {
        return this.interventionService.getUrgentInterventions();
    }

    @Get('status/:status')
    @ApiOperation({ summary: 'Interventions par statut' })
    getByStatus(@Param('status') status: InterventionStatus) {
        return this.interventionService.getInterventionsByStatus(status);
    }

    @Get('technician/:technicianId')
    @ApiOperation({ summary: 'Interventions d\'un technicien' })
    @ApiQuery({ name: 'date', required: false, type: String, description: 'Date spécifique (YYYY-MM-DD)' })
    getByTechnician(
        @Param('technicianId', ParseUUIDPipe) technicianId: string,
        @Query('date') date?: string,
    ) {
        const queryDate = date ? new Date(date) : undefined;
        return this.interventionService.findByTechnician(technicianId, queryDate);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Détails d\'une intervention' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.interventionService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Mettre à jour une intervention' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateInterventionDto: UpdateInterventionDto,
    ) {
        return this.interventionService.update(id, updateInterventionDto);
    }

    @Patch(':id/assign/:technicianId')
    @ApiOperation({ summary: 'Assigner un technicien à une intervention' })
    assignTechnician(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('technicianId', ParseUUIDPipe) technicianId: string,
    ) {
        return this.interventionService.assignTechnician(id, technicianId);
    }

    @Patch(':id/start')
    @ApiOperation({ summary: 'Démarrer une intervention' })
    startIntervention(@Param('id', ParseUUIDPipe) id: string) {
        return this.interventionService.startIntervention(id);
    }

    @Patch(':id/complete')
    @ApiOperation({ summary: 'Terminer une intervention' })
    completeIntervention(@Param('id', ParseUUIDPipe) id: string) {
        return this.interventionService.completeIntervention(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer une intervention' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.interventionService.remove(id);
    }
} 