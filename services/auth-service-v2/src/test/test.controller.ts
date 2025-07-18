import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('test')
export class TestController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get('ping')
  async testPing() {
    try {
      const response = await firstValueFrom(
        this.client.send({ cmd: 'clients.list' }, { 
          token: 'test-token',
          page: 1,
          limit: 10 
        })
      );
      return { success: true, response };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        stack: error.stack 
      };
    }
  }
}
