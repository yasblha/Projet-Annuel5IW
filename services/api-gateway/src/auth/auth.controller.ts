import { Controller, Post, Body, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from '../application/dtos/auth/register.dto';
import { LoginDto } from '../application/dtos/auth/login.dto';
import { ConfirmDto } from '../application/dtos/auth/confirm.dto';
import { ChangePasswordDto } from '../application/dtos/auth/change-password.dto';
import { ForgotPasswordDto } from '../application/dtos/auth/forgot-password.dto';
import { ResetPasswordDto } from '../application/dtos/auth/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() data: RegisterDto) {
    return this.handleRequest('auth.register', data);
  }

  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.handleRequest('auth.login', data);
  }

  @Post('admin/register')
  async registerByAdmin(@Body() data: RegisterDto) {
    return this.handleRequest('auth.admin.register', data);
  }

  @Post('invite')
  async invite(@Body() data: RegisterDto) {
    return this.handleRequest('auth.invite', data);
  }

  @Post('confirm')
  async confirm(@Body() data: ConfirmDto) {
    return this.handleRequest('auth.confirm', data);
  }

  @Post('activate')
  async activate(@Body() data: ChangePasswordDto) {
    return this.handleRequest('auth.activate', data);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.handleRequest('auth.forgot-password', data);
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.handleRequest('auth.reset-password', data);
  }

  private async handleRequest(pattern: string, data: any) {
    try {
      return await firstValueFrom(
        this.authService.send(pattern, data)
      );
    } catch (error) {
      const err = error as any;
      let status = Number(err.status);
      if (isNaN(status) || status < 100 || status > 599) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(
        err.message || 'Erreur serveur',
        status
      );
    }
  }
}