import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';

@Module({
  providers: [MailerService],
  controllers: [MailerService, MailerController]
})
export class MailerModule {}
