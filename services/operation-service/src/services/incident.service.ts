import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Incident, IncidentStatus, IncidentPriority } from '../entities/incident.entity';
import { CreateIncidentDto } from '../dto/create-incident.dto';
import { NotificationService } from './notification.service';

@Injectable()
export class IncidentService {
    constructor(
        @InjectRepository(Incident)
        private incidentRepository: Repository<Incident>,
        private notificationService: NotificationService,
    ) { }

    async create(createIncidentDto: CreateIncidentDto): Promise<Incident> {
        const incident = this.incidentRepository.create(createIncidentDto);

        // Priorisation automatique basée sur le type d'incident
        incident.priority = this.calculatePriority(incident);

        const savedIncident = await this.incidentRepository.save(incident);

        // Notifier si c'est urgent
        if (incident.priority === IncidentPriority.CRITICAL) {
            await this.notificationService.notifyUrgentIncident(savedIncident);
        }

        return savedIncident;
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ data: Incident[], total: number }> {
        const [data, total] = await this.incidentRepository.findAndCount({
            relations: ['interventions'],
            skip: (page - 1) * limit,
            take: limit,
            order: {
                priority: 'DESC',
                createdAt: 'DESC'
            }
        });

        return { data, total };
    }

    async findOne(id: string): Promise<Incident> {
        const incident = await this.incidentRepository.findOne({
            where: { id },
            relations: ['interventions', 'interventions.technician']
        });

        if (!incident) {
            throw new NotFoundException('Incident non trouvé');
        }

        return incident;
    }

    async updateStatus(id: string, status: IncidentStatus, resolution?: string): Promise<Incident> {
        const incident = await this.findOne(id);

        incident.status = status;

        if (status === IncidentStatus.RESOLVED && resolution) {
            incident.resolution = resolution;
            incident.resolvedAt = new Date();
        }

        return await this.incidentRepository.save(incident);
    }

    async getIncidentsByPriority(priority: IncidentPriority): Promise<Incident[]> {
        return await this.incidentRepository.find({
            where: {
                priority,
                status: In([IncidentStatus.REPORTED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.ASSIGNED])
            },
            relations: ['interventions'],
            order: { createdAt: 'DESC' }
        });
    }

    async getOpenIncidents(): Promise<Incident[]> {
        return await this.incidentRepository.find({
            where: {
                status: In([
                    IncidentStatus.REPORTED,
                    IncidentStatus.ACKNOWLEDGED,
                    IncidentStatus.ASSIGNED,
                    IncidentStatus.IN_PROGRESS
                ])
            },
            relations: ['interventions'],
            order: {
                priority: 'DESC',
                createdAt: 'DESC'
            }
        });
    }

    async getCriticalIncidents(): Promise<Incident[]> {
        return await this.getIncidentsByPriority(IncidentPriority.CRITICAL);
    }

    async getIncidentStats(): Promise<any> {
        const total = await this.incidentRepository.count();
        const open = await this.incidentRepository.count({
            where: {
                status: In([
                    IncidentStatus.REPORTED,
                    IncidentStatus.ACKNOWLEDGED,
                    IncidentStatus.ASSIGNED,
                    IncidentStatus.IN_PROGRESS
                ])
            }
        });

        const critical = await this.incidentRepository.count({
            where: { priority: IncidentPriority.CRITICAL }
        });

        const resolved = await this.incidentRepository.count({
            where: { status: IncidentStatus.RESOLVED }
        });

        return {
            total,
            open,
            critical,
            resolved,
            resolutionRate: total > 0 ? (resolved / total * 100).toFixed(2) : 0
        };
    }

    async acknowledgeIncident(id: string): Promise<Incident> {
        const incident = await this.findOne(id);
        incident.status = IncidentStatus.ACKNOWLEDGED;
        return await this.incidentRepository.save(incident);
    }

    async assignIncident(id: string): Promise<Incident> {
        const incident = await this.findOne(id);
        incident.status = IncidentStatus.ASSIGNED;
        return await this.incidentRepository.save(incident);
    }

    private calculatePriority(incident: Incident): IncidentPriority {
        // Logique de priorisation automatique
        const criticalKeywords = ['fuite majeure', 'rupture', 'explosion', 'urgence', 'danger'];
        const highKeywords = ['fuite', 'panne', 'arrêt', 'défaillance'];

        const description = incident.description.toLowerCase();
        const title = incident.title.toLowerCase();
        const fullText = `${title} ${description}`;

        // Vérifier les mots-clés critiques
        if (criticalKeywords.some(keyword => fullText.includes(keyword))) {
            return IncidentPriority.CRITICAL;
        }

        // Vérifier les mots-clés de haute priorité
        if (highKeywords.some(keyword => fullText.includes(keyword))) {
            return IncidentPriority.HIGH;
        }

        // Priorité basée sur le type d'incident
        switch (incident.type) {
            case 'emergency':
                return IncidentPriority.CRITICAL;
            case 'leak':
            case 'power_outage':
                return IncidentPriority.HIGH;
            case 'equipment_failure':
                return IncidentPriority.MEDIUM;
            default:
                return IncidentPriority.LOW;
        }
    }
} 