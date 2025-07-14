import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ListUsersUseCase } from '@application/usecases/users/list-users.usecase';
import { CreateUserUseCase } from '@application/usecases/users/create-user.usecase';
import { UpdateUserUseCase } from '@application/usecases/users/update-user.usecase';
import { UpdateUserStatusUseCase } from '@application/usecases/users/update-user-status.usecase';
import { DeleteUserUseCase } from '@application/usecases/users/delete-user.usecase';
import { ResendInvitationUseCase } from '@application/usecases/users/resend-invitation.usecase';
import { AuthGuard } from '@infrastructure/guards/auth.guard';
import { RolesGuard } from '@infrastructure/guards/roles.guard';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserRole } from '@Database/models/enums/userRole.enum';

@Controller('users')
export class UsersController {
  constructor(
    private readonly listUsers: ListUsersUseCase,
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly updateUserStatus: UpdateUserStatusUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly resendInvitation: ResendInvitationUseCase,
  ) {}

  // ENDPOINTS HTTP (avec guards)
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTEUR)
  async list(@Query() query: any) {
    return this.listUsers.execute(query);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTEUR)
  async create(@Body() body: any) {
    return this.createUser.execute(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTEUR)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.updateUser.execute({ id: Number(id), ...body });
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTEUR)
  async updateStatus(@Param('id') id: string, @Body('statut') statut: any) {
    return this.updateUserStatus.execute(Number(id), statut);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.deleteUser.execute(Number(id));
  }

  @Post(':id/resend-invitation')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTEUR)
  async resend(@Param('id') id: string) {
    return this.resendInvitation.execute(Number(id));
  }

  // HANDLERS MICROSERVICES POUR API GATEWAY (SANS GUARDS)
  @MessagePattern('users.list')
  async listMicro(@Payload() query: any) {
    return this.listUsers.execute(query);
  }

  @MessagePattern('users.create')
  async createMicro(@Payload() body: any) {
    return this.createUser.execute(body);
  }

  @MessagePattern('users.update')
  async updateMicro(@Payload() data: any) {
    return this.updateUser.execute(data);
  }

  @MessagePattern('users.updateStatus')
  async updateStatusMicro(@Payload() data: any) {
    return this.updateUserStatus.execute(data.id, data.statut);
  }

  @MessagePattern('users.delete')
  async deleteMicro(@Payload() data: any) {
    return this.deleteUser.execute(data.id);
  }

  @MessagePattern('users.resendInvitation')
  async resendMicro(@Payload() data: any) {
    return this.resendInvitation.execute(data.id);
  }
}