import { Controller, Post, Body, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() data: any) {
    return this.handleRequest('auth.register', data);
  }

  @Post('login')
  async login(@Body() data: any) {
    return this.handleRequest('auth.login', data);
  }

  @Post('admin/register')
  async registerByAdmin(@Body() data: any) {
    return this.handleRequest('auth.admin.register', data);
  }

  @Post('invite')
  async invite(@Body() data: any) {
    return this.handleRequest('auth.invite', data);
  }

  @Post('confirm')
  async confirm(@Body() data: any) {
    return this.handleRequest('auth.confirm', data);
  }

  @Post('activate')
  async activate(@Body() data: any) {
    return this.handleRequest('auth.activate', data);
  }

  private async handleRequest(pattern: string, data: any) {
    try {
      return await firstValueFrom(
        this.authService.send(pattern, data)
      );
    } catch (error) {
      const err = error as any;
      throw new HttpException(
        err.message || 'Erreur serveur',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}