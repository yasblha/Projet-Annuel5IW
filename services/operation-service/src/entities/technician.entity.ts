import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Intervention } from './intervention.entity';

export enum TechnicianStatus {
    AVAILABLE = 'available',
    BUSY = 'busy',
    OFF_DUTY = 'off_duty',
    VACATION = 'vacation'
}

export enum TechnicianSkill {
    PLUMBING = 'plumbing',
    ELECTRICAL = 'electrical',
    MECHANICAL = 'mechanical',
    ELECTRONICS = 'electronics',
    EMERGENCY = 'emergency'
}

@Entity('technicians')
export class Technician {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    firstName: string;

    @Column({ type: 'varchar', length: 100 })
    lastName: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 20 })
    phone: string;

    @Column({ type: 'varchar', length: 50 })
    employeeId: string;

    @Column({
        type: 'enum',
        enum: TechnicianStatus,
        default: TechnicianStatus.AVAILABLE
    })
    status: TechnicianStatus;

    @Column({ type: 'simple-array', nullable: true })
    skills: TechnicianSkill[];

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    currentLatitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    currentLongitude: number;

    @Column({ type: 'timestamp', nullable: true })
    lastLocationUpdate: Date;

    @OneToMany(() => Intervention, (intervention) => intervention.technician)
    interventions: Intervention[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 