import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IoTReading } from './iot-reading.entity';

export enum DeviceType {
    WATER_METER = 'water_meter',
    PRESSURE_SENSOR = 'pressure_sensor',
    FLOW_SENSOR = 'flow_sensor',
    QUALITY_SENSOR = 'quality_sensor',
    TEMPERATURE_SENSOR = 'temperature_sensor',
    VALVE_CONTROLLER = 'valve_controller'
}

export enum DeviceStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    MAINTENANCE = 'maintenance',
    ERROR = 'error'
}

@Entity('iot_devices')
export class IoTDevice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    deviceId: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({
        type: 'enum',
        enum: DeviceType
    })
    type: DeviceType;

    @Column({
        type: 'enum',
        enum: DeviceStatus,
        default: DeviceStatus.OFFLINE
    })
    status: DeviceStatus;

    @Column({ type: 'varchar', length: 500 })
    location: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    manufacturer: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    model: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    serialNumber: string;

    @Column({ type: 'timestamp', nullable: true })
    lastCommunication: Date;

    @Column({ type: 'json', nullable: true })
    configuration: any;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @OneToMany(() => IoTReading, reading => reading.device)
    readings: IoTReading[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 