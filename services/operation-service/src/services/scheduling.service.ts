import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Intervention, InterventionPriority, InterventionStatus } from '../entities/intervention.entity';
import { Technician, TechnicianStatus, TechnicianSkill } from '../entities/technician.entity';
import { Incident, IncidentPriority } from '../entities/incident.entity';
import { InterventionService } from './intervention.service';
import { NotificationService } from './notification.service';
import { addHours, startOfDay, endOfDay, isWeekend, addDays } from 'date-fns';

interface SchedulingOptions {
    considerTravel?: boolean;
    maxWorkloadPerTechnician?: number;
    preferredTimeSlots?: { start: number; end: number }[];
    emergencyOnly?: boolean;
}

@Injectable()
export class SchedulingService {
    constructor(
        @InjectRepository(Intervention)
        private interventionRepository: Repository<Intervention>,
        @InjectRepository(Technician)
        private technicianRepository: Repository<Technician>,
        @InjectRepository(Incident)
        private incidentRepository: Repository<Incident>,
        private interventionService: InterventionService,
        private notificationService: NotificationService,
    ) { }

    /**
     * Planification intelligente d'une intervention
     */
    async scheduleIntervention(
        interventionId: string,
        options: SchedulingOptions = {}
    ): Promise<{
        scheduledDate: Date;
        technicianId: string;
        estimatedDuration: number;
        confidence: number;
    }> {
        const intervention = await this.interventionRepository.findOne({
            where: { id: interventionId },
            relations: ['incident']
        });

        if (!intervention) {
            throw new Error('Intervention non trouvée');
        }

        // Trouver le meilleur technicien
        const bestTechnician = await this.findBestTechnician(intervention, options);

        // Trouver le meilleur créneau
        const optimalSlot = await this.findOptimalTimeSlot(
            bestTechnician.id,
            intervention,
            options
        );

        // Calculer la durée estimée
        const estimatedDuration = this.estimateInterventionDuration(intervention);

        // Calculer la confiance dans cette planification
        const confidence = this.calculateSchedulingConfidence(
            intervention,
            bestTechnician,
            optimalSlot
        );

        return {
            scheduledDate: optimalSlot,
            technicianId: bestTechnician.id,
            estimatedDuration,
            confidence
        };
    }

    /**
     * Optimisation automatique du planning quotidien
     */
    async optimizeDailySchedule(date: Date): Promise<any[]> {
        const interventions = await this.interventionRepository.find({
            where: {
                scheduledDate: Between(startOfDay(date), endOfDay(date)),
                status: In([InterventionStatus.PLANNED, InterventionStatus.ASSIGNED])
            },
            relations: ['technician', 'incident']
        });

        const optimizations = [];

        for (const intervention of interventions) {
            const currentScheduling = {
                technicianId: intervention.technicianId,
                scheduledDate: intervention.scheduledDate
            };

            const optimizedScheduling = await this.scheduleIntervention(intervention.id, {
                considerTravel: true,
                maxWorkloadPerTechnician: 8 // heures
            });

            // Si l'optimisation améliore significativement la planification
            if (optimizedScheduling.confidence > 0.8) {
                optimizations.push({
                    interventionId: intervention.id,
                    current: currentScheduling,
                    optimized: optimizedScheduling,
                    improvement: optimizedScheduling.confidence
                });
            }
        }

        return optimizations;
    }

    /**
     * Gestion automatique des interventions urgentes
     */
    async handleEmergencyScheduling(incidentId: string): Promise<void> {
        const incident = await this.incidentRepository.findOne({
            where: { id: incidentId }
        });

        if (!incident || incident.priority !== IncidentPriority.CRITICAL) {
            return;
        }

        // Trouver le technicien le plus proche et disponible
        const availableTechnicians = await this.technicianRepository.find({
            where: { status: TechnicianStatus.AVAILABLE }
        });

        if (availableTechnicians.length === 0) {
            // Chercher des techniciens avec des interventions reportables
            await this.findReschedulableInterventions();
        }

        // Créer une intervention d'urgence
        const emergencyIntervention = await this.interventionService.create({
            title: `URGENCE: ${incident.title}`,
            description: incident.description,
            type: 'emergency' as any,
            priority: InterventionPriority.URGENT,
            location: incident.location,
            latitude: incident.latitude,
            longitude: incident.longitude,
            scheduledDate: new Date(), // Immédiatement
            incidentId: incident.id
        });

        // Assigner automatiquement
        const scheduling = await this.scheduleIntervention(emergencyIntervention.id, {
            emergencyOnly: true
        });

        await this.interventionService.assignTechnician(
            emergencyIntervention.id,
            scheduling.technicianId
        );

        // Notifier
        await this.notificationService.notifyUrgentIncident(incident);
    }

    /**
     * Tâche automatique : vérification des interventions en retard
     */
    @Cron(CronExpression.EVERY_10_MINUTES)
    async checkOverdueInterventions(): Promise<void> {
        const overdueInterventions = await this.interventionRepository.find({
            where: {
                scheduledDate: LessThan(new Date()),
                status: In([InterventionStatus.PLANNED, InterventionStatus.ASSIGNED])
            },
            relations: ['technician']
        });

        for (const intervention of overdueInterventions) {
            await this.notificationService.notifyInterventionOverdue(intervention);

            // Tentative de reprogrammation automatique
            const rescheduling = await this.scheduleIntervention(intervention.id);

            if (rescheduling.confidence > 0.7) {
                await this.interventionRepository.update(intervention.id, {
                    scheduledDate: rescheduling.scheduledDate,
                    technicianId: rescheduling.technicianId
                });
            }
        }
    }

    /**
     * Tâche automatique : optimisation nocturne du planning
     */
    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async nightlyScheduleOptimization(): Promise<void> {
        const tomorrow = addDays(new Date(), 1);

        if (isWeekend(tomorrow)) {
            return; // Pas d'optimisation les weekends
        }

        const optimizations = await this.optimizeDailySchedule(tomorrow);

        // Appliquer les optimisations avec un bon score de confiance
        for (const opt of optimizations) {
            if (opt.improvement > 0.85) {
                await this.interventionRepository.update(opt.interventionId, {
                    scheduledDate: opt.optimized.scheduledDate,
                    technicianId: opt.optimized.technicianId,
                    estimatedDuration: opt.optimized.estimatedDuration
                });
            }
        }
    }

    private async findBestTechnician(
        intervention: Intervention,
        options: SchedulingOptions
    ): Promise<Technician> {
        const availableTechnicians = await this.technicianRepository.find({
            where: { status: In([TechnicianStatus.AVAILABLE, TechnicianStatus.BUSY]) }
        });

        let bestTechnician = null;
        let bestScore = 0;

        for (const technician of availableTechnicians) {
            const score = await this.calculateTechnicianScore(technician, intervention, options);

            if (score > bestScore) {
                bestScore = score;
                bestTechnician = technician;
            }
        }

        return bestTechnician || availableTechnicians[0];
    }

    private async calculateTechnicianScore(
        technician: Technician,
        intervention: Intervention,
        options: SchedulingOptions
    ): Promise<number> {
        let score = 0;

        // Score basé sur les compétences (40%)
        const skillMatch = this.calculateSkillMatch(technician, intervention);
        score += skillMatch * 0.4;

        // Score basé sur la disponibilité (30%)
        const availability = await this.calculateAvailabilityScore(technician);
        score += availability * 0.3;

        // Score basé sur la proximité géographique (20%)
        if (options.considerTravel && technician.currentLatitude && technician.currentLongitude) {
            const proximity = this.calculateProximityScore(technician, intervention);
            score += proximity * 0.2;
        }

        // Score basé sur la charge de travail (10%)
        const workload = await this.calculateWorkloadScore(technician);
        score += workload * 0.1;

        return score;
    }

    private calculateSkillMatch(technician: Technician, intervention: Intervention): number {
        if (!technician.skills || technician.skills.length === 0) {
            return 0.5; // Score neutre si pas de compétences définies
        }

        const requiredSkills = this.getRequiredSkills(intervention);
        const matchingSkills = technician.skills.filter(skill =>
            requiredSkills.includes(skill)
        );

        return matchingSkills.length / requiredSkills.length;
    }

    private getRequiredSkills(intervention: Intervention): TechnicianSkill[] {
        const skillMap = {
            'maintenance': [TechnicianSkill.MECHANICAL, TechnicianSkill.PLUMBING],
            'repair': [TechnicianSkill.MECHANICAL, TechnicianSkill.ELECTRICAL],
            'installation': [TechnicianSkill.PLUMBING, TechnicianSkill.ELECTRICAL],
            'emergency': [TechnicianSkill.EMERGENCY],
            'reading': [TechnicianSkill.ELECTRONICS],
            'cutting': [TechnicianSkill.MECHANICAL]
        };

        return skillMap[intervention.type] || [TechnicianSkill.MECHANICAL];
    }

    private async calculateAvailabilityScore(technician: Technician): Promise<number> {
        if (technician.status === TechnicianStatus.AVAILABLE) {
            return 1.0;
        }
        if (technician.status === TechnicianStatus.BUSY) {
            return 0.3;
        }
        return 0.0;
    }

    private calculateProximityScore(technician: Technician, intervention: Intervention): number {
        if (!technician.currentLatitude || !intervention.latitude) {
            return 0.5; // Score neutre si pas de coordonnées
        }

        // Calcul approximatif de la distance (formule haversine simplifiée)
        const distance = Math.sqrt(
            Math.pow(technician.currentLatitude - intervention.latitude, 2) +
            Math.pow(technician.currentLongitude - intervention.longitude, 2)
        ) * 111; // Conversion approximative en km

        // Score inversement proportionnel à la distance
        return Math.max(0, 1 - (distance / 50)); // 50km = score 0
    }

    private async calculateWorkloadScore(technician: Technician): Promise<number> {
        const today = new Date();
        const todayInterventions = await this.interventionRepository.count({
            where: {
                technicianId: technician.id,
                scheduledDate: Between(startOfDay(today), endOfDay(today)),
                status: In([InterventionStatus.PLANNED, InterventionStatus.ASSIGNED, InterventionStatus.IN_PROGRESS])
            }
        });

        // Score inversement proportionnel au nombre d'interventions
        return Math.max(0, 1 - (todayInterventions / 6)); // 6 interventions = score 0
    }

    private async findOptimalTimeSlot(
        technicianId: string,
        intervention: Intervention,
        options: SchedulingOptions
    ): Promise<Date> {
        const priority = intervention.priority;
        let targetDate = new Date();

        // Pour les urgences, programmer immédiatement
        if (priority === InterventionPriority.URGENT) {
            return targetDate;
        }

        // Pour les autres, trouver le prochain créneau disponible
        const workingHours = options.preferredTimeSlots || [
            { start: 8, end: 12 },
            { start: 14, end: 18 }
        ];

        for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
            const checkDate = addDays(targetDate, dayOffset);

            if (isWeekend(checkDate)) continue;

            for (const slot of workingHours) {
                const slotTime = new Date(checkDate);
                slotTime.setHours(slot.start, 0, 0, 0);

                const isAvailable = await this.isTimeSlotAvailable(
                    technicianId,
                    slotTime,
                    intervention.estimatedDuration || 120
                );

                if (isAvailable) {
                    return slotTime;
                }
            }
        }

        // Si aucun créneau trouvé, programmer dans 2 semaines
        return addDays(targetDate, 14);
    }

    private async isTimeSlotAvailable(
        technicianId: string,
        startTime: Date,
        durationMinutes: number
    ): Promise<boolean> {
        const endTime = addHours(startTime, durationMinutes / 60);

        const conflictingInterventions = await this.interventionRepository.count({
            where: {
                technicianId,
                scheduledDate: Between(startTime, endTime),
                status: In([InterventionStatus.PLANNED, InterventionStatus.ASSIGNED, InterventionStatus.IN_PROGRESS])
            }
        });

        return conflictingInterventions === 0;
    }

    private estimateInterventionDuration(intervention: Intervention): number {
        const baseDurations = {
            'maintenance': 120, // 2 heures
            'repair': 180,      // 3 heures
            'installation': 240, // 4 heures
            'emergency': 90,     // 1.5 heure
            'reading': 30,       // 30 minutes
            'cutting': 60        // 1 heure
        };

        let baseDuration = baseDurations[intervention.type] || 120;

        // Ajustement selon la priorité
        if (intervention.priority === InterventionPriority.URGENT) {
            baseDuration *= 0.8; // Plus rapide en urgence
        }

        return baseDuration;
    }

    private calculateSchedulingConfidence(
        intervention: Intervention,
        technician: Technician,
        scheduledDate: Date
    ): number {
        let confidence = 0.5; // Base

        // Compétences du technicien
        const skillMatch = this.calculateSkillMatch(technician, intervention);
        confidence += skillMatch * 0.3;

        // Disponibilité
        if (technician.status === TechnicianStatus.AVAILABLE) {
            confidence += 0.2;
        }

        // Délai de planification
        const delayHours = (scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60);
        if (delayHours < 24) confidence += 0.1;
        if (delayHours < 4) confidence += 0.1;

        return Math.min(1.0, confidence);
    }

    private async findReschedulableInterventions(): Promise<Intervention[]> {
        return await this.interventionRepository.find({
            where: {
                priority: In([InterventionPriority.LOW, InterventionPriority.MEDIUM]),
                status: In([InterventionStatus.PLANNED, InterventionStatus.ASSIGNED]),
                scheduledDate: Between(new Date(), addDays(new Date(), 7))
            },
            relations: ['technician']
        });
    }
} 