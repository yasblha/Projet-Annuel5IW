"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.enableCors();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Auth Service V2 API')
        .setDescription('Authentication and User Management API')
        .setVersion('2.0')
        .addTag('auth')
        .addTag('users')
        .addTag('roles')
        .addTag('clients')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
            queue: 'auth_queue_v2',
            queueOptions: {
                durable: true,
                persistent: true,
            },
            noAck: false,
        },
    });
    await app.startAllMicroservices();
    const port = process.env.AUTH_SERVICE_PORT || 3001;
    await app.listen(process.env.AUTH_SERVICE_PORT || 3001, '0.0.0.0');
    console.log(`Auth Service V2 is running on port: ${port}`);
    console.log(`Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map