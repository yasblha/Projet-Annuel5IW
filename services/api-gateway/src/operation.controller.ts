import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('incidents')
export class IncidentsProxyController {
    constructor(private readonly http: HttpService) { }

    @Get()
    async findAll(@Query() query: any) {
        const { data } = await firstValueFrom(
            this.http.get('http://operation-service:3000/incidents', { params: query })
        );
        return data;
    }

    @Post()
    async create(@Body() body: any) {
        const { data } = await firstValueFrom(
            this.http.post('http://operation-service:3000/incidents', body)
        );
        return data;
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const { data } = await firstValueFrom(
            this.http.get(`http://operation-service:3000/incidents/${id}`)
        );
        return data;
    }
}

@Controller('interventions')
export class InterventionsProxyController {
    constructor(private readonly http: HttpService) { }

    @Get()
    async findAll(@Query() query: any) {
        const { data } = await firstValueFrom(
            this.http.get('http://operation-service:3000/interventions', { params: query })
        );
        return data;
    }

    @Post()
    async create(@Body() body: any) {
        const { data } = await firstValueFrom(
            this.http.post('http://operation-service:3000/interventions', body)
        );
        return data;
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const { data } = await firstValueFrom(
            this.http.get(`http://operation-service:3000/interventions/${id}`)
        );
        return data;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        const { data } = await firstValueFrom(
            this.http.patch(`http://operation-service:3000/interventions/${id}`, body)
        );
        return data;
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const { data } = await firstValueFrom(
            this.http.delete(`http://operation-service:3000/interventions/${id}`)
        );
        return data;
    }

    @Get('calendar')
    async getCalendarView(@Query('start') startDate: string, @Query('end') endDate: string) {
        const { data } = await firstValueFrom(
            this.http.get('http://operation-service:3000/interventions/calendar', {
                params: { start: startDate, end: endDate }
            })
        );
        return data;
    }

    @Get('urgent')
    async getUrgentInterventions() {
        const { data } = await firstValueFrom(
            this.http.get('http://operation-service:3000/interventions/urgent')
        );
        return data;
    }
}

@Controller('iot')
export class IoTProxyController {
    constructor(private readonly http: HttpService) { }

    @Get('devices')
    async getAllDevices() {
        const { data } = await firstValueFrom(
            this.http.get('http://operation-service:3000/iot/devices')
        );
        return data;
    }

    @Get('devices/:id')
    async getDevice(@Param('id') id: string) {
        const { data } = await firstValueFrom(
            this.http.get(`http://operation-service:3000/iot/devices/${id}`)
        );
        return data;
    }

    @Get('devices/:id/readings')
    async getDeviceReadings(@Param('id') id: string, @Query('limit') limit?: number) {
        const { data } = await firstValueFrom(
            this.http.get(`http://operation-service:3000/iot/devices/${id}/readings`, {
                params: { limit }
            })
        );
        return data;
    }

    @Get('devices/:id/latest')
    async getLatestReading(@Param('id') id: string) {
        const { data } = await firstValueFrom(
            this.http.get(`http://operation-service:3000/iot/devices/${id}/latest`)
        );
        return data;
    }

    @Post('devices/:id/readings')
    async addReading(@Param('id') id: string, @Body() reading: any) {
        const { data } = await firstValueFrom(
            this.http.post(`http://operation-service:3000/iot/devices/${id}/readings`, reading)
        );
        return data;
    }

    @Get('readings/alerts')
    async getAlerts() {
        const { data } = await firstValueFrom(
            this.http.get('http://operation-service:3000/iot/readings/alerts')
        );
        return data;
    }

    @Get('devices/status/offline')
    async getOfflineDevices() {
        const { data } = await firstValueFrom(
            this.http.get('http://operation-service:3000/iot/devices/status/offline')
        );
        return data;
    }

    @Post('devices/:id/maintenance')
    async scheduleMaintenance(@Param('id') id: string, @Body() maintenance: any) {
        const { data } = await firstValueFrom(
            this.http.post(`http://operation-service:3000/iot/devices/${id}/maintenance`, maintenance)
        );
        return data;
    }
} 