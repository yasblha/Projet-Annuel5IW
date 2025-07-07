import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Inject, HttpException, HttpStatus } from '@nestjs/common';
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
  async list(@Query() query: ListUsersDto) {
    return this.handleRequest('users.list', query);
  }

  @Post()
  async create(@Body() body: CreateUserDto) {
    return this.handleRequest('users.create', body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.handleRequest('users.update', { id: Number(id), ...body });
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateUserStatusDto) {
    return this.handleRequest('users.updateStatus', { id: Number(id), statut: body.statut });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.handleRequest('users.delete', { id: Number(id) });
  }

  @Post(':id/resend-invitation')
  async resendInvitation(@Param('id') id: string) {
    return this.handleRequest('users.resendInvitation', { id: Number(id) });
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