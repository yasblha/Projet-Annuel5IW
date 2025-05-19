import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    NestMailerModule.forRoot({
      transport: {
        host: 'smtp.domain.com',
        port: 465,
        secure: true,
        auth: {
          user: 'contactprojectys@gmail.com',
          pass: 'mvuogahxlrxrlpwi',
        },
      },
      defaults: {
        from: '"Water App" <no-reply@aquaerp.com>',
      },
      template: {
        dir: __dirname + '/mailer/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    MailerModule,
  ],
})
export class AppModule {}
