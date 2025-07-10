import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from '@infrastructure/guards/auth.guard';
import { GuardsModule } from '@infrastructure/guards/guards.module';

@Module({
  imports: [
    GuardsModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
})
export class AuthModule {}
