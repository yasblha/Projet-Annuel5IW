import { Controller, Post, Body, Inject, HttpException, HttpStatus, Get, Param, Put, UseGuards, Headers, Query, Delete } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth-v2')
@Controller('auth/v2')
export class AuthV2Controller {
  constructor(
    @Inject('AUTH_SERVICE_V2') private readonly authServiceV2: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @Post('register')
  async register(@Body() data: any) {
    return this.handleRequest('auth.register', data);
  }

  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @Post('login')
  async login(@Body() data: any) {
    return this.handleRequest('auth.login', data);
  }

  @ApiOperation({ summary: 'Rafraîchissement du token d\'authentification' })
  @ApiResponse({ status: 200, description: 'Token rafraîchi avec succès' })
  @ApiResponse({ status: 401, description: 'Token invalide ou expiré' })
  @Post('refresh')
  async refreshToken(@Body() data: { userId: string }) {
    return this.handleRequest('auth.refresh', data);
  }

  @ApiOperation({ summary: 'Invitation d\'un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Invitation envoyée avec succès' })
  @ApiBearerAuth()
  @Post('invite')
  async invite(@Body() data: any, @Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('auth.invite', { ...data, token });
  }

  @ApiOperation({ summary: 'Activation d\'un compte utilisateur' })
  @ApiResponse({ status: 200, description: 'Compte activé avec succès' })
  @Post('activate')
  async activate(@Body() data: any) {
    return this.handleRequest('auth.activate', data);
  }

  @ApiOperation({ summary: 'Demande de réinitialisation de mot de passe' })
  @ApiResponse({ status: 200, description: 'Email de réinitialisation envoyé' })
  @Post('forgot-password')
  async forgotPassword(@Body() data: any) {
    return this.handleRequest('auth.forgot-password', data);
  }

  @ApiOperation({ summary: 'Réinitialisation de mot de passe' })
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé avec succès' })
  @Post('reset-password')
  async resetPassword(@Body() data: any) {
    return this.handleRequest('auth.reset-password', data);
  }

  @ApiOperation({ summary: 'Récupération des informations utilisateur' })
  @ApiResponse({ status: 200, description: 'Informations utilisateur récupérées' })
  @ApiBearerAuth()
  @Get('me')
  async me(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('auth.me', { token });
  }

  @ApiOperation({ summary: 'Déconnexion' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  @ApiBearerAuth()
  @Post('logout')
  async logout(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('auth.logout', { token });
  }

  @ApiOperation({ summary: 'Liste des utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée' })
  @ApiBearerAuth()
  @Get('users')
  async getUsers(
    @Headers('authorization') auth: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('auth.users.list', { 
      token,
      page,
      limit,
      role,
      status,
      search
    });
  }

  @ApiOperation({ summary: 'Récupération d\'un utilisateur par ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur récupéré' })
  @ApiBearerAuth()
  @Get('users/:id')
  async getUserById(@Param('id') id: string, @Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('auth.users.get', { id, token });
  }

  @ApiOperation({ summary: 'Mise à jour d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @ApiBearerAuth()
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any, @Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('auth.users.update', { id, ...data, token });
  }

  @ApiOperation({ summary: 'Suppression d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé avec succès' })
  @ApiBearerAuth()
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('auth.users.delete', { id, token });
  }

  private async handleRequest(pattern: string, data: any) {
    try {
      console.log(`[DEBUG] Sending ${pattern} with data:`, JSON.stringify(data));
      const result = await firstValueFrom(
        this.authServiceV2.send(pattern, data)
      );
      console.log(`[DEBUG] Received response for ${pattern}:`, JSON.stringify(result));
      return result;
    } catch (error) {
      console.error(`[ERROR] Error in ${pattern}:`, error);
      const errorObject = {};
      Object.getOwnPropertyNames(error).forEach(prop => {
        errorObject[prop] = error[prop];
      });
      console.error(`[ERROR] Full error:`, JSON.stringify(errorObject, null, 2));
      const err = error as any;
      let status = Number(err.status || err.statusCode || err.response?.status || err.response?.statusCode);
      if (isNaN(status) || status < 100 || status > 599) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(
        err.message || err.response?.message || 'Erreur serveur',
        status
      );
    }
  }
}
