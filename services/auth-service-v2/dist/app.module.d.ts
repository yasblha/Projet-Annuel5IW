import { NestModule, MiddlewareConsumer } from '@nestjs/common';
export declare class AppModule implements NestModule {
    private readonly logger;
    constructor();
    configure(consumer: MiddlewareConsumer): void;
}
