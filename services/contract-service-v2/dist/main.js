"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const dotenv = require("dotenv");
dotenv.config();
const DEFAULT_RMQ_URL = 'amqp://admin:admin@rabbitmq:5672';
const DEFAULT_RMQ_QUEUE = 'contract_queue_v2';
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || DEFAULT_RMQ_URL],
            queue: process.env.RABBITMQ_QUEUE || DEFAULT_RMQ_QUEUE,
            queueOptions: {
                durable: true,
            },
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.startAllMicroservices();
    await app.listen(process.env.PORT || 3000);
    console.log(`Contract Service V2 is running on: ${await app.getUrl()}`);
    console.log(`RabbitMQ connected to: ${process.env.RABBITMQ_URL || DEFAULT_RMQ_URL}`);
    console.log(`Using queue: ${process.env.RABBITMQ_QUEUE || DEFAULT_RMQ_QUEUE}`);
}
bootstrap();
//# sourceMappingURL=main.js.map