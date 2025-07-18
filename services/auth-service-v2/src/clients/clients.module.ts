import { Module, Logger } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ClientsService } from './clients.service';
import { ClientsMessageHandler } from './clients.message-handler';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [ClientsMessageHandler],
  providers: [
    ClientsService,
    Logger,
    {
      provide: 'CLIENTS_LOGGER',
      useFactory: () => {
        const logger = new Logger('ClientsModule');
        logger.log('ClientsModule initialized');
        return logger;
      }
    }
  ],
  exports: [ClientsService],
})
export class ClientsModule {
  constructor(private readonly logger: Logger) {
    this.logger.log('ClientsModule constructor called');
  }
}
