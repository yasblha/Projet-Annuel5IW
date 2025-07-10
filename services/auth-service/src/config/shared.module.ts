import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from '@Database/repositories/user.repository';
import { AdresseRepository } from '@Database/repositories/adresse.repository';
import { EntrepriseRepository } from '@Database/repositories/entreprise.repository';
import { PasswordService } from '@application/services/password.service';

@Global()
@Module({
  imports: [
    // Configuration RabbitMQ centralisée
    ClientsModule.register([
      {
        name: 'MAILER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
          queue: 'mailer_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
    // Configuration JWT centralisée
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    // Services partagés
    UserRepository,
    AdresseRepository,
    EntrepriseRepository,
    PasswordService,
  ],
  exports: [
    // Export pour que tous les modules puissent les utiliser
    ClientsModule,
    JwtModule,
    UserRepository,
    AdresseRepository,
    EntrepriseRepository,
    PasswordService,
  ],
})
export class SharedModule {} 