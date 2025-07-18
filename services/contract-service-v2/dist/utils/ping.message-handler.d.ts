import { JwtService } from '@nestjs/jwt';
export declare class PingMessageHandler {
    private readonly jwtService;
    private readonly logger;
    constructor(jwtService: JwtService);
    ping(data: any): Promise<{
        status: string;
        data: {
            message: string;
            timestamp: string;
            version: string;
            receivedData: any;
            tokenInfo: any;
        };
    }>;
}
