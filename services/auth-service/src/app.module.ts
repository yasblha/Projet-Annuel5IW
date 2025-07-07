import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesGuard } from '@infrastructure/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { GuardsModule } from '@infrastructure/guards/guards.module';


@Module({
  imports: [
    GuardsModule,
    ClientsModule.register([
      {
        name: 'MAILER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: 'mailer_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    AuthModule, 
    UsersModule,
    GuardsModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: RolesGuard
  },
  ],
})
export class AppModule {}
