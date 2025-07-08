import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Intervention, InterventionStatus } from '../entities/intervention.entity';
import { Technician, TechnicianStatus } from '../entities/technician.entity';
import { CreateInterventionDto } from '../dto/create-intervention.dto';
import { UpdateInterventionDto } from '../dto/update-intervention.dto';
import { WorkOrderService } from './work-order.service';
import { NotificationService } from './notification.service';
import { startOfDay, endOfDay, addDays } from 'date-fns';

@Injectable()
export class InterventionService {
    constructor(
        @InjectRepository(Intervention)
        private interventionRepository: Repository<Intervention>,
        @InjectRepository(Technician)
        private technicianRepository: Repository<Technician>,
        private workOrderService: WorkOrderService,
        private notificationService: NotificationService,
    ) { }

    async create(createInterventionDto: CreateInterventionDto): Promise<Intervention> {
        // Valider le technicien si assigné
        if (createInterventionDto.technicianId) {
            const technician = await this.technicianRepository.findOne({
                where: { id: createInterventionDto.technicianId }
            });
            if (!technician) {
                throw new NotFoundException('Technicien non trouvé');
            }
        }

        const intervention = this.interventionRepository.create(createInterventionDto);

        // Générer automatiquement un numéro de bon d'intervention
        intervention.workOrderNumber = await this.workOrderService.generateWorkOrderNumber();

        const savedIntervention = await this.interventionRepository.save(intervention);

        // Notifier le technicien si assigné
        if (savedIntervention.technicianId) {
            await this.notificationService.notifyInterventionAssigned(savedIntervention);
        }

        return savedIntervention;
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ data: Intervention[], total: number }> {
        const [data, total] = await this.interventionRepository.findAndCount({
            relations: ['technician', 'incident', 'reports'],
            skip: (page - 1) * limit,
            take: limit,
            order: { scheduledDate: 'ASC' }
        });

        return { data, total };
    }

    async findOne(id: string): Promise<Intervention> {
        const intervention = await this.interventionRepository.findOne({
            where: { id },
            relations: ['technician', 'incident', 'reports']
        });

        if (!intervention) {
            throw new NotFoundException('Intervention non trouvée');
        }

        return intervention;
    }

    async update(id: string, updateInterventionDto: UpdateInterventionDto): Promise<Intervention> {
        const intervention = await this.findOne(id);

        // Valider le technicien si changé
        if (updateInterventionDto.technicianId && updateInterventionDto.technicianId !== intervention.technicianId) {
            const technician = await this.technicianRepository.findOne({
                where: { id: updateInterventionDto.technicianId }
            });
            if (!technician) {
                throw new NotFoundException('Technicien non trouvé');
            }

            // Notifier le nouveau technicien
            await this.notificationService.notifyInterventionReassigned(intervention, technician);
        }

        // Gestion des changements de statut
        if (updateInterventionDto.status && updateInterventionDto.status !== intervention.status) {
            await this.handleStatusChange(intervention, updateInterventionDto.status);
        }

        Object.assign(intervention, updateInterventionDto);
        return await this.interventionRepository.save(intervention);
    }

    async remove(id: string): Promise<void> {
        const intervention = await this.findOne(id);

        if (intervention.status === InterventionStatus.IN_PROGRESS) {
            throw new BadRequestException('Impossible de supprimer une intervention en cours');
        }

        await this.interventionRepository.remove(intervention);
    }

    async findByTechnician(technicianId: string, date?: Date): Promise<Intervention[]> {
        const whereClause: any = { technicianId };

        if (date) {
            whereClause.scheduledDate = Between(startOfDay(date), endOfDay(date));
        }

        return await this.interventionRepository.find({
            where: whereClause,
            relations: ['incident'],
            order: { scheduledDate: 'ASC' }
        });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Intervention[]> {
        return await this.interventionRepository.find({
            where: {
                scheduledDate: Between(startDate, endDate)
            },
            relations: ['technician', 'incident'],
            order: { scheduledDate: 'ASC' }
        });
    }

    async getCalendarView(startDate: Date, endDate: Date): Promise<any[]> {
        const interventions = await this.findByDateRange(startDate, endDate);

        return interventions.map(intervention => ({
            id: intervention.id,
            title: intervention.title,
            start: intervention.scheduledDate,
            end: intervention.scheduledDate,
            backgroundColor: this.getStatusColor(intervention.status),
            extendedProps: {
                technician: intervention.technician?.firstName + ' ' + intervention.technician?.lastName,
                status: intervention.status,
                priority: intervention.priority,
                location: intervention.location
            }
        }));
    }

    async assignTechnician(interventionId: string, technicianId: string): Promise<Intervention> {
        const intervention = await this.findOne(interventionId);
        const technician = await this.technicianRepository.findOne({
            where: { id: technicianId }
        });

        if (!technician) {
            throw new NotFoundException('Technicien non trouvé');
        }

        if (technician.status !== TechnicianStatus.AVAILABLE) {
            throw new BadRequestException('Le technicien n\'est pas disponible');
        }

        intervention.technicianId = technicianId;
        intervention.status = InterventionStatus.ASSIGNED;

        const savedIntervention = await this.interventionRepository.save(intervention);

        // Notifier le technicien
        await this.notificationService.notifyInterventionAssigned(savedIntervention);

        return savedIntervention;
    }

    async startIntervention(id: string): Promise<Intervention> {
        const intervention = await this.findOne(id);

        if (intervention.status !== InterventionStatus.ASSIGNED) {
            throw new BadRequestException('L\'intervention doit être assignée pour pouvoir être démarrée');
        }

        intervention.status = InterventionStatus.IN_PROGRESS;
        intervention.startedAt = new Date();

        // Marquer le technicien comme occupé
        if (intervention.technicianId) {
            await this.technicianRepository.update(intervention.technicianId, {
                status: TechnicianStatus.BUSY
            });
        }

        return await this.interventionRepository.save(intervention);
    }

    async completeIntervention(id: string): Promise<Intervention> {
        const intervention = await this.findOne(id);

        if (intervention.status !== InterventionStatus.IN_PROGRESS) {
            throw new BadRequestException('L\'intervention doit être en cours pour pouvoir être terminée');
        }

        intervention.status = InterventionStatus.COMPLETED;
        intervention.completedAt = new Date();

        // Calculer la durée réelle
        if (intervention.startedAt) {
            const duration = Math.round((intervention.completedAt.getTime() - intervention.startedAt.getTime()) / (1000 * 60));
            intervention.actualDuration = duration;
        }

        // Libérer le technicien
        if (intervention.technicianId) {
            await this.technicianRepository.update(intervention.technicianId, {
                status: TechnicianStatus.AVAILABLE
            });
        }

        return await this.interventionRepository.save(intervention);
    }

    async getInterventionsByStatus(status: InterventionStatus): Promise<Intervention[]> {
        return await this.interventionRepository.find({
            where: { status },
            relations: ['technician', 'incident'],
            order: { scheduledDate: 'ASC' }
        });
    }

    async getUrgentInterventions(): Promise<Intervention[]> {
        return await this.interventionRepository.find({
            where: {
                priority: In(['high', 'urgent']),
                status: In([InterventionStatus.PLANNED, InterventionStatus.ASSIGNED])
            },
            relations: ['technician', 'incident'],
            order: { priority: 'DESC', scheduledDate: 'ASC' }
        });
    }

    private async handleStatusChange(intervention: Intervention, newStatus: InterventionStatus): Promise<void> {
        switch (newStatus) {
            case InterventionStatus.IN_PROGRESS:
                intervention.startedAt = new Date();
                break;
            case InterventionStatus.COMPLETED:
                intervention.completedAt = new Date();
                if (intervention.startedAt) {
                    const duration = Math.round((Date.now() - intervention.startedAt.getTime()) / (1000 * 60));
                    intervention.actualDuration = duration;
                }
                break;
            case InterventionStatus.CANCELLED:
                // Libérer le technicien si assigné
                if (intervention.technicianId) {
                    await this.technicianRepository.update(intervention.technicianId, {
                        status: TechnicianStatus.AVAILABLE
                    });
                }
                break;
        }
    }

    private getStatusColor(status: InterventionStatus): string {
        const colors = {
            [InterventionStatus.PLANNED]: '#6c757d',
            [InterventionStatus.ASSIGNED]: '#007bff',
            [InterventionStatus.IN_PROGRESS]: '#ffc107',
            [InterventionStatus.COMPLETED]: '#28a745',
            [InterventionStatus.CANCELLED]: '#dc3545',
            [InterventionStatus.POSTPONED]: '#fd7e14'
        };
        return colors[status] || '#6c757d';
    }
} 