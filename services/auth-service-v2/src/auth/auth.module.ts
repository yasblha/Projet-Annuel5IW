import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthMessageHandler } from './auth.message-handler';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from '../infrastructure/guards/jwt.strategy';
import { RolesModule } from '../roles/roles.module';
import { MailAdapter } from '../infrastructure/adapters/mail.adapter';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PassportModule,
    ClientsModule.register([
      {
        name: 'MAILER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
          queue: 'mailer_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-v2',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController, AuthMessageHandler],
  providers: [AuthService, JwtStrategy, MailAdapter],
  exports: [AuthService],
})
export class AuthModule {}
