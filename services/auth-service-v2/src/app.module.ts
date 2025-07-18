import { Module, NestModule, MiddlewareConsumer, Logger } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ClientsModule as NestClientModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { DatabaseModule } from './config/database.module';
import { TenantMiddleware } from './infrastructure/middleware/tenant.middleware';
import { ClientsModule } from './clients/clients.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    NestClientModule.register([
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
    AuthModule,
    UsersModule,
    RolesModule,
    ClientsModule,
    TestModule,
  ],
  providers: [Logger],
})
export class AppModule implements NestModule {
  private readonly logger = new Logger('AppModule');

  constructor() {
    this.logger.log('AppModule initialized');
    this.logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    this.logger.log(`RabbitMQ URL: ${process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'}`);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
