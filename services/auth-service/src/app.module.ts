import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetadataController } from './metadata.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { RolesGuard } from '@infrastructure/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { GuardsModule } from '@infrastructure/guards/guards.module';
import { SharedModule } from './config/shared.module';

@Module({
  imports: [
    SharedModule, // Configuration centralisée
    GuardsModule,
    AuthModule, 
    UsersModule,
    ClientsModule,
  ],
  controllers: [AppController, MetadataController],
  providers: [
    AppService, 
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
  ],
})
export class AppModule {}
