import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../infrastructure/guards/roles.guard';
import { Roles } from '../infrastructure/guards/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async inviteUser(@Request() req, @Body() inviteUserDto: InviteUserDto) {
    return this.usersService.inviteUser(req.user.sub, inviteUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users in the agency' })
  @ApiResponse({ status: 200, description: 'Return all users in the agency' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    return this.usersService.findAllByAgency(req.user.agency_id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return the current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.sub);
  }
}
