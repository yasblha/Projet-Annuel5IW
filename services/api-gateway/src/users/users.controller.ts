import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Inject, HttpException, HttpStatus, Headers } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from '../application/dtos/users/create-user.dto';
import { UpdateUserDto } from '../application/dtos/users/update-user.dto';
import { UpdateUserStatusDto } from '../application/dtos/users/update-user-status.dto';
import { ListUsersDto } from '../application/dtos/users/list-users.dto';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  @Get()
  async list(@Query() query: ListUsersDto, @Headers('authorization') authorization?: string) {
    return this.handleRequest('users.list', { ...query, authorization });
  }

  @Post()
  async create(@Body() body: CreateUserDto, @Headers('authorization') authorization?: string) {
    return this.handleRequest('users.create', { ...body, authorization });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto, @Headers('authorization') authorization?: string) {
    return this.handleRequest('users.update', { id: Number(id), ...body, authorization });
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateUserStatusDto, @Headers('authorization') authorization?: string) {
    return this.handleRequest('users.updateStatus', { id: Number(id), statut: body.statut, authorization });
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    return this.handleRequest('users.delete', { id: Number(id), authorization });
  }

  @Post(':id/resend-invitation')
  async resendInvitation(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    return this.handleRequest('users.resendInvitation', { id: Number(id), authorization });
  }

  private async handleRequest(pattern: string, data: any) {
    try {
      return await firstValueFrom(
        this.authService.send(pattern, data)
      );
    } catch (error) {
      const err = error as any;
      console.error(`❌ [UsersController] Erreur ${pattern}:`, err.message);
      
      // Gestion spécifique des erreurs de validation
      if (err.message && err.message.includes('existe déjà')) {
        throw new HttpException(
          err.message,
          HttpStatus.CONFLICT // 409 Conflict
        );
      }
      
      // Gestion des erreurs de validation Sequelize
      if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors?.[0]?.path || 'champ';
        throw new HttpException(
          `Le ${field} existe déjà.`,
          HttpStatus.CONFLICT
        );
      }
      
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