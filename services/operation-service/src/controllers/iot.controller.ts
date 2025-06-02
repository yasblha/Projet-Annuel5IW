import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    ParseUUIDPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IoTService } from '../services/iot.service';

@ApiTags('iot')
@Controller('iot')
export class IoTController {
    constructor(private readonly iotService: IoTService) { }

    @Get('devices')
    @ApiOperation({ summary: 'Lister tous les dispositifs IoT' })
    getAllDevices() {
        return this.iotService.getAllDevices();
    }

    @Get('devices/:id')
    @ApiOperation({ summary: 'Détails d\'un dispositif IoT' })
    getDevice(@Param('id', ParseUUIDPipe) id: string) {
        return this.iotService.getDevice(id);
    }

    @Get('devices/:id/readings')
    @ApiOperation({ summary: 'Relevés d\'un dispositif' })
    getDeviceReadings(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('limit') limit?: number,
    ) {
        return this.iotService.getDeviceReadings(id, limit);
    }

    @Get('devices/:id/latest')
    @ApiOperation({ summary: 'Dernière lecture d\'un dispositif' })
    getLatestReading(@Param('id', ParseUUIDPipe) id: string) {
        return this.iotService.getLatestReading(id);
    }

    @Post('devices/:id/readings')
    @ApiOperation({ summary: 'Ajouter une nouvelle lecture (webhook IoT)' })
    addReading(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() reading: {
            metric: string;
            value: number;
            unit?: string;
            timestamp?: Date;
            metadata?: any;
        },
    ) {
        return this.iotService.addReading(id, reading);
    }

    @Get('readings/alerts')
    @ApiOperation({ summary: 'Alertes basées sur les seuils IoT' })
    getAlerts() {
        return this.iotService.getActiveAlerts();
    }

    @Get('devices/status/offline')
    @ApiOperation({ summary: 'Dispositifs hors ligne' })
    getOfflineDevices() {
        return this.iotService.getOfflineDevices();
    }

    @Post('devices/:id/maintenance')
    @ApiOperation({ summary: 'Programmer une maintenance préventive' })
    scheduleMaintenance(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() maintenance: {
            description: string;
            scheduledDate: Date;
            priority?: string;
        },
    ) {
        return this.iotService.scheduleMaintenance(id, maintenance);
    }
} 