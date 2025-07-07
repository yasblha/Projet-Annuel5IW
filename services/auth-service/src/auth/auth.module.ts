import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';
import { AuthGuard } from '@infrastructure/guards/auth.guard';
import { GuardsModule } from '@infrastructure/guards/guards.module';

@Module({
  imports: [
    GuardsModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret-key',
      signOptions: { expiresIn: '1h' },
    }),
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
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, PasswordService, UserRepository],
})
export class AuthModule {}
