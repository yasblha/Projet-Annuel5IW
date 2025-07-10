import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ListUsersUseCase } from '@application/usecases/users/list-users.usecase';
import { CreateUserUseCase } from '@application/usecases/users/create-user.usecase';
import { UpdateUserUseCase } from '@application/usecases/users/update-user.usecase';
import { UpdateUserStatusUseCase } from '@application/usecases/users/update-user-status.usecase';
import { DeleteUserUseCase } from '@application/usecases/users/delete-user.usecase';
import { ResendInvitationUseCase } from '@application/usecases/users/resend-invitation.usecase';

@Module({
  providers: [
    UsersService,
    ListUsersUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    UpdateUserStatusUseCase,
    DeleteUserUseCase,
    ResendInvitationUseCase,
  ],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
