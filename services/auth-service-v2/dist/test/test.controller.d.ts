import { ClientProxy } from '@nestjs/microservices';
export declare class TestController {
    private readonly client;
    constructor(client: ClientProxy);
    testPing(): Promise<{
        success: boolean;
        response: any;
        error?: undefined;
        stack?: undefined;
    } | {
        success: boolean;
        error: any;
        stack: any;
        response?: undefined;
    }>;
}
