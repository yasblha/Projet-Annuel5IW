import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    NestMailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'contactprojectys@gmail.com',
          pass: 'mvuogahxlrxrlpwi',
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: '"Water App" <contactprojectys@gmail.com>',
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
})
export class AppModule {}
