import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerModule } from './mailer/mailer.module';
import { FactureEvents } from './events/facture.events';

@Module({
  imports: [
    NestMailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true' || false,
        auth: {
          user: process.env.SMTP_USER || 'contactprojectys@gmail.com',
          pass: process.env.SMTP_PASS || 'mvuogahxlrxrlpwi',
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: process.env.SMTP_FROM || '"Water App" <contactprojectys@gmail.com>',
      },
      template: {
        dir: process.env.NODE_ENV === 'production'
          ? __dirname + '/mailer/templates'
          : __dirname + '/../src/mailer/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    MailerModule,
  ],
  providers: [
    FactureEvents
  ],
})
export class AppModule {}
