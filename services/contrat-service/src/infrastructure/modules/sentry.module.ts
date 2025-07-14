import { DynamicModule, Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { SentryModuleOptions } from '../config/sentry.config';

@Module({})
export class SentryModule {
  static forRoot(options: SentryModuleOptions): DynamicModule {
    // Initialize Sentry
    Sentry.init({
      dsn: options.dsn,
      debug: options.debug,
      environment: options.environment,
      release: options.release,
      tracesSampleRate: options.tracesSampleRate,
      integrations: options.integrations,
    });

    const providers: Provider[] = [
      {
        provide: APP_INTERCEPTOR,
        useClass: SentryInterceptor,
      },
    ];

    return {
      module: SentryModule,
      providers,
      exports: [],
    };
  }
}
