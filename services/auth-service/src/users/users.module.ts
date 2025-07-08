import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';
import { UsersController } from './users.controller';
import { ListUsersUseCase } from '@application/usecases/users/list-users.usecase';
import { CreateUserUseCase } from '@application/usecases/users/create-user.usecase';
import { UpdateUserUseCase } from '@application/usecases/users/update-user.usecase';
import { UpdateUserStatusUseCase } from '@application/usecases/users/update-user-status.usecase';
import { DeleteUserUseCase } from '@application/usecases/users/delete-user.usecase';
import { ResendInvitationUseCase } from '@application/usecases/users/resend-invitation.usecase';
import { JwtModule } from '@nestjs/jwt';



@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MAILER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'mailer_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    UsersService,
    UserRepository,
    PasswordService,
    ListUsersUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    UpdateUserStatusUseCase,
    DeleteUserUseCase,
    ResendInvitationUseCase
  ],
  exports: [UsersService, UserRepository, PasswordService],
  controllers: [UsersController],

})
export class UsersModule {}
