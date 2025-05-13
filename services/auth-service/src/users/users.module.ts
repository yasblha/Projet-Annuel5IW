import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';

@Module({
  providers: [UsersService, UserRepository, PasswordService, ],
    exports: [UsersService, UserRepository, PasswordService, ],
})
export class UsersModule {}
