import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { Intervention } from './entities/intervention.entity';
import { Technician } from './entities/technician.entity';
import { Incident } from './entities/incident.entity';
import { InterventionReport } from './entities/intervention-report.entity';
import { IoTDevice } from './entities/iot-device.entity';
import { IoTReading } from './entities/iot-reading.entity';

// Controllers
import { InterventionController } from './controllers/intervention.controller';
import { IncidentController } from './controllers/incident.controller';
import { IoTController } from './controllers/iot.controller';

// Services
import { InterventionService } from './services/intervention.service';
import { IncidentService } from './services/incident.service';
import { IoTService } from './services/iot.service';
import { WorkOrderService } from './services/work-order.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    // Configuration TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'operation_service',
      entities: [
        Intervention,
        Technician,
        Incident,
        InterventionReport,
        IoTDevice,
        IoTReading
      ],
      synchronize: process.env.NODE_ENV !== 'production', // À désactiver en production
      logging: process.env.NODE_ENV === 'development',
    }),

    // Repositories TypeORM
    TypeOrmModule.forFeature([
      Intervention,
      Technician,
      Incident,
      InterventionReport,
      IoTDevice,
      IoTReading
    ]),

    // Module de planification pour les tâches automatiques
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    InterventionController,
    IncidentController,
    IoTController
  ],
  providers: [
    AppService,
    InterventionService,
    IncidentService,
    IoTService,
    WorkOrderService,
    NotificationService,
  ],
  exports: [
    InterventionService,
    IncidentService,
    IoTService,
    NotificationService,
  ],
})
export class AppModule { }
