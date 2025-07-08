import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Technician } from './technician.entity';
import { Incident } from './incident.entity';
import { InterventionReport } from './intervention-report.entity';

export enum InterventionType {
    MAINTENANCE = 'maintenance',
    REPAIR = 'repair',
    INSTALLATION = 'installation',
    READING = 'reading',
    CUTTING = 'cutting',
    EMERGENCY = 'emergency'
}

export enum InterventionStatus {
    PLANNED = 'planned',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    POSTPONED = 'postponed'
}

export enum InterventionPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

@Entity('interventions')
export class Intervention {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: InterventionType,
        default: InterventionType.MAINTENANCE
    })
    type: InterventionType;

    @Column({
        type: 'enum',
        enum: InterventionStatus,
        default: InterventionStatus.PLANNED
    })
    status: InterventionStatus;

    @Column({
        type: 'enum',
        enum: InterventionPriority,
        default: InterventionPriority.MEDIUM
    })
    priority: InterventionPriority;

    @Column({ type: 'varchar', length: 500 })
    location: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ type: 'timestamp' })
    scheduledDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    startedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @Column({ type: 'int', default: 0 })
    estimatedDuration: number; // in minutes

    @Column({ type: 'int', default: 0 })
    actualDuration: number; // in minutes

    @Column({ type: 'varchar', length: 255, nullable: true })
    workOrderNumber: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @ManyToOne(() => Technician, technician => technician.interventions)
    technician: Technician;

    @Column({ type: 'uuid', nullable: true })
    technicianId: string;

    @ManyToOne(() => Incident, incident => incident.interventions, { nullable: true })
    incident: Incident;

    @Column({ type: 'uuid', nullable: true })
    incidentId: string;

    @OneToMany(() => InterventionReport, report => report.intervention)
    reports: InterventionReport[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 