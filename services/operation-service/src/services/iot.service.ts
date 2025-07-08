import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { IoTDevice, DeviceStatus } from '../entities/iot-device.entity';
import { IoTReading } from '../entities/iot-reading.entity';
import { InterventionService } from './intervention.service';
import { NotificationService } from './notification.service';
import { CreateInterventionDto } from '../dto/create-intervention.dto';
import { InterventionType, InterventionPriority } from '../entities/intervention.entity';
import { subHours, subDays } from 'date-fns';

@Injectable()
export class IoTService {
    private readonly alertThresholds = {
        pressure: { min: 1.5, max: 6.0 }, // bar
        flow_rate: { min: 0, max: 1000 }, // L/min
        temperature: { min: 0, max: 50 }, // °C
        water_level: { min: 10, max: 95 }, // %
    };

    constructor(
        @InjectRepository(IoTDevice)
        private deviceRepository: Repository<IoTDevice>,
        @InjectRepository(IoTReading)
        private readingRepository: Repository<IoTReading>,
        private interventionService: InterventionService,
        private notificationService: NotificationService,
    ) { }

    async getAllDevices(): Promise<IoTDevice[]> {
        return await this.deviceRepository.find({
            relations: ['readings'],
            order: { createdAt: 'DESC' }
        });
    }

    async getDevice(id: string): Promise<IoTDevice> {
        const device = await this.deviceRepository.findOne({
            where: { id },
            relations: ['readings']
        });

        if (!device) {
            throw new NotFoundException('Dispositif non trouvé');
        }

        return device;
    }

    async getDeviceReadings(deviceId: string, limit: number = 100): Promise<IoTReading[]> {
        return await this.readingRepository.find({
            where: { deviceId },
            order: { timestamp: 'DESC' },
            take: limit
        });
    }

    async getLatestReading(deviceId: string): Promise<IoTReading | null> {
        return await this.readingRepository.findOne({
            where: { deviceId },
            order: { timestamp: 'DESC' }
        });
    }

    async addReading(deviceId: string, readingData: {
        metric: string;
        value: number;
        unit?: string;
        timestamp?: Date;
        metadata?: any;
    }): Promise<IoTReading> {
        // Vérifier que le dispositif existe
        const device = await this.getDevice(deviceId);

        // Créer la lecture
        const reading = this.readingRepository.create({
            ...readingData,
            deviceId,
            timestamp: readingData.timestamp || new Date()
        });

        const savedReading = await this.readingRepository.save(reading);

        // Mettre à jour le statut du dispositif
        await this.updateDeviceStatus(deviceId, DeviceStatus.ONLINE);

        // Vérifier les seuils d'alerte
        await this.checkAlertThresholds(device, savedReading);

        return savedReading;
    }

    async getActiveAlerts(): Promise<any[]> {
        const alerts = [];
        const devices = await this.getAllDevices();

        for (const device of devices) {
            const latestReading = await this.getLatestReading(device.id);

            if (latestReading) {
                const alert = this.checkReadingThresholds(device, latestReading);
                if (alert) {
                    alerts.push(alert);
                }
            }

            // Vérifier si le dispositif est hors ligne
            if (device.lastCommunication &&
                device.lastCommunication < subHours(new Date(), 2)) {
                alerts.push({
                    type: 'device_offline',
                    deviceId: device.id,
                    deviceName: device.name,
                    message: `Dispositif ${device.name} hors ligne depuis ${device.lastCommunication}`,
                    severity: 'high',
                    timestamp: new Date()
                });
            }
        }

        return alerts;
    }

    async getOfflineDevices(): Promise<IoTDevice[]> {
        const twoHoursAgo = subHours(new Date(), 2);

        return await this.deviceRepository.find({
            where: [
                { status: DeviceStatus.OFFLINE },
                { lastCommunication: LessThan(twoHoursAgo) }
            ]
        });
    }

    async scheduleMaintenance(deviceId: string, maintenanceData: {
        description: string;
        scheduledDate: Date;
        priority?: string;
    }): Promise<any> {
        const device = await this.getDevice(deviceId);

        // Créer une intervention de maintenance
        const interventionDto: CreateInterventionDto = {
            title: `Maintenance ${device.name}`,
            description: maintenanceData.description,
            type: InterventionType.MAINTENANCE,
            priority: this.mapPriorityToEnum(maintenanceData.priority),
            location: device.location,
            latitude: device.latitude,
            longitude: device.longitude,
            scheduledDate: maintenanceData.scheduledDate
        };

        return await this.interventionService.create(interventionDto);
    }

    async processAutoReadings(): Promise<void> {
        // Simuler la réception de données IoT automatiques
        const onlineDevices = await this.deviceRepository.find({
            where: { status: DeviceStatus.ONLINE }
        });

        for (const device of onlineDevices) {
            // Générer des données simulées basées sur le type de dispositif
            const mockReading = this.generateMockReading(device);

            if (mockReading) {
                await this.addReading(device.id, mockReading);
            }
        }
    }

    private async updateDeviceStatus(deviceId: string, status: DeviceStatus): Promise<void> {
        await this.deviceRepository.update(deviceId, {
            status,
            lastCommunication: new Date()
        });
    }

    private async checkAlertThresholds(device: IoTDevice, reading: IoTReading): Promise<void> {
        const alert = this.checkReadingThresholds(device, reading);

        if (alert) {
            // Notifier les équipes
            await this.notificationService.notifyEquipmentFailure(
                device.deviceId,
                alert.message
            );

            // Créer automatiquement une intervention d'urgence si nécessaire
            if (alert.severity === 'critical') {
                await this.createEmergencyIntervention(device, alert);
            }
        }
    }

    private checkReadingThresholds(device: IoTDevice, reading: IoTReading): any | null {
        const thresholds = this.alertThresholds[reading.metric];

        if (!thresholds) return null;

        if (reading.value < thresholds.min || reading.value > thresholds.max) {
            const severity = this.calculateSeverity(reading.metric, reading.value, thresholds);

            return {
                type: 'threshold_exceeded',
                deviceId: device.id,
                deviceName: device.name,
                metric: reading.metric,
                value: reading.value,
                unit: reading.unit,
                threshold: thresholds,
                message: `${reading.metric} hors limites: ${reading.value} ${reading.unit || ''}`,
                severity,
                timestamp: reading.timestamp
            };
        }

        return null;
    }

    private calculateSeverity(metric: string, value: number, thresholds: any): string {
        const range = thresholds.max - thresholds.min;
        const deviation = Math.abs(value - (value < thresholds.min ? thresholds.min : thresholds.max));
        const percentDeviation = (deviation / range) * 100;

        if (percentDeviation > 50) return 'critical';
        if (percentDeviation > 25) return 'high';
        if (percentDeviation > 10) return 'medium';
        return 'low';
    }

    private async createEmergencyIntervention(device: IoTDevice, alert: any): Promise<void> {
        const interventionDto: CreateInterventionDto = {
            title: `URGENCE: ${alert.message}`,
            description: `Alerte automatique: ${device.name} - ${alert.message}`,
            type: InterventionType.EMERGENCY,
            priority: InterventionPriority.URGENT,
            location: device.location,
            latitude: device.latitude,
            longitude: device.longitude,
            scheduledDate: new Date()
        };

        await this.interventionService.create(interventionDto);
    }

    private generateMockReading(device: IoTDevice): any | null {
        const baseReadings = {
            'water_meter': { metric: 'flow_rate', value: Math.random() * 100 + 50, unit: 'L/min' },
            'pressure_sensor': { metric: 'pressure', value: Math.random() * 3 + 2, unit: 'bar' },
            'temperature_sensor': { metric: 'temperature', value: Math.random() * 20 + 15, unit: '°C' },
            'quality_sensor': { metric: 'ph', value: Math.random() * 2 + 6.5, unit: 'pH' },
        };

        return baseReadings[device.type] || null;
    }

    private mapPriorityToEnum(priority?: string): InterventionPriority {
        switch (priority?.toLowerCase()) {
            case 'urgent': return InterventionPriority.URGENT;
            case 'high': return InterventionPriority.HIGH;
            case 'low': return InterventionPriority.LOW;
            default: return InterventionPriority.MEDIUM;
        }
    }
} 