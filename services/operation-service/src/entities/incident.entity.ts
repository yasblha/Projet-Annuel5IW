import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Intervention } from './intervention.entity';

export enum IncidentType {
    LEAK = 'leak',
    POWER_OUTAGE = 'power_outage',
    EQUIPMENT_FAILURE = 'equipment_failure',
    EMERGENCY = 'emergency',
    MAINTENANCE_REQUEST = 'maintenance_request',
    WATER_QUALITY = 'water_quality',
    PRESSURE_ISSUE = 'pressure_issue'
}

export enum IncidentStatus {
    REPORTED = 'reported',
    ACKNOWLEDGED = 'acknowledged',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
}

export enum IncidentPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

@Entity('incidents')
export class Incident {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: IncidentType,
        default: IncidentType.MAINTENANCE_REQUEST
    })
    type: IncidentType;

    @Column({
        type: 'enum',
        enum: IncidentStatus,
        default: IncidentStatus.REPORTED
    })
    status: IncidentStatus;

    @Column({
        type: 'enum',
        enum: IncidentPriority,
        default: IncidentPriority.MEDIUM
    })
    priority: IncidentPriority;

    @Column({ type: 'varchar', length: 500 })
    location: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    reportedBy: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    reporterContact: string;

    @Column({ type: 'timestamp', nullable: true })
    resolvedAt: Date;

    @Column({ type: 'text', nullable: true })
    resolution: string;

    @Column({ type: 'simple-array', nullable: true })
    attachments: string[]; // URLs des photos/documents

    @OneToMany(() => Intervention, intervention => intervention.incident)
    interventions: Intervention[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 