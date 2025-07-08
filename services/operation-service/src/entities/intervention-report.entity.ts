import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Intervention } from './intervention.entity';

@Entity('intervention_reports')
export class InterventionReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text', nullable: true })
    workPerformed: string;

    @Column({ type: 'text', nullable: true })
    materialsUsed: string;

    @Column({ type: 'text', nullable: true })
    observations: string;

    @Column({ type: 'text', nullable: true })
    recommendations: string;

    @Column({ type: 'simple-array', nullable: true })
    photos: string[]; // URLs des photos

    @Column({ type: 'simple-array', nullable: true })
    attachments: string[]; // URLs des documents

    @Column({ type: 'boolean', default: false })
    customerSignature: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    customerName: string;

    @Column({ type: 'timestamp', nullable: true })
    signedAt: Date;

    @ManyToOne(() => Intervention, intervention => intervention.reports)
    intervention: Intervention;

    @Column({ type: 'uuid' })
    interventionId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 