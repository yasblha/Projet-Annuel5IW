import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { IoTDevice } from './iot-device.entity';

@Entity('iot_readings')
export class IoTReading {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    metric: string; // e.g., 'flow_rate', 'pressure', 'temperature'

    @Column({ type: 'decimal', precision: 15, scale: 6 })
    value: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    unit: string; // e.g., 'L/min', 'bar', '°C'

    @Column({ type: 'json', nullable: true })
    metadata: any; // Additional sensor data

    @Column({ type: 'timestamp' })
    timestamp: Date;

    @ManyToOne(() => IoTDevice, device => device.readings)
    device: IoTDevice;

    @Column({ type: 'uuid' })
    deviceId: string;

    @CreateDateColumn()
    createdAt: Date;
} 