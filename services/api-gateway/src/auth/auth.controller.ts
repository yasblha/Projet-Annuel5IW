import { Controller, Post, Body, Inject, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RegisterDto, LoginDto, AuthResponseDto, ConfirmDto } from '@application/dtos/auth';
import { Roles } from '@infrastructure/guards/roles.decorator';
import { AuthGuard } from '@infrastructure/guards/auth.guard';
import { RolesGuard } from '@infrastructure/guards/roles.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Inscription utilisateur',
    description: 'Crée un nouveau compte utilisateur'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    type: AuthResponseDto,
    description: 'Utilisateur créé avec succès'
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides'
  })
  @ApiResponse({
    status: 409,
    description: 'Email déjà utilisé'
  })
  async register(@Body() registerData: RegisterDto) {
    return this.handleRequest('auth.register', registerData);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Connexion utilisateur',
    description: 'Authentifie un utilisateur avec email et mot de passe'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: { $ref: '#/components/schemas/UserResponse' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides'
  })
  async login(@Body() loginData: LoginDto) {
    return this.handleRequest('auth.login', loginData);
  }

  @Post('admin/register')
  @ApiOperation({
    summary: 'Inscription par administrateur',
    description: 'Permet à un administrateur de créer un nouveau compte utilisateur'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    type: AuthResponseDto,
    description: 'Utilisateur créé avec succès'
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé - Réservé aux administrateurs'
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async registerByAdmin(@Body() registerData: RegisterDto) {
    return this.handleRequest('auth.admin.register', registerData);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Envoi d\'une invitation', description: 'Génère un token et envoie un email' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async invite(@Body('userId') userId: string) {
    return this.handleRequest('auth.invite', { userId });
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmation d\'invitation' })
  @ApiBody({ type: ConfirmDto })
  async confirm(@Body() data: ConfirmDto) {
    return this.handleRequest('auth.confirm', data);
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