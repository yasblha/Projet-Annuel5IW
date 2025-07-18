import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsersService } from '../users/users.service';

@Controller()
export class AuthMessageHandler {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @MessagePattern('auth.register')
  async register(data: RegisterDto) {
    console.log('[DEBUG] Received register request with data:', JSON.stringify({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role
    }));
    try {
      const result = await this.authService.register(data);
      console.log('[DEBUG] Registration successful for user:', data.email);
      return result;
    } catch (error) {
      console.error('[ERROR] Registration failed:', error.message);
      console.error('[ERROR] Full error details:', error);
      // Renvoyer une réponse structurée pour faciliter le débogage
      return { 
        status: 'error', 
        message: error.message || 'Internal server error',
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  @MessagePattern('auth.login')
  async login(data: LoginDto) {
    console.log('[DEBUG] Received login request with data:', JSON.stringify({ email: data.email }));
    try {
      const result = await this.authService.login(data);
      console.log('[DEBUG] Login successful for user:', data.email);
      return result;
    } catch (error) {
      console.error('[ERROR] Login failed:', error.message);
      console.error('[ERROR] Full error details:', error);
      return { 
        status: 'error', 
        message: error.message || 'Internal server error',
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  @MessagePattern('auth.refresh')
  async refreshToken(data: RefreshTokenDto) {
    return this.authService.refreshToken(data);
  }

  @MessagePattern('auth.activate')
  async activateAccount(data: ActivateAccountDto) {
    return this.authService.activateAccount(data);
  }

  @MessagePattern('auth.forgot-password')
  async forgotPassword(data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @MessagePattern('auth.reset-password')
  async resetPassword(data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @MessagePattern('auth.me')
  async me(data: { token: string }) {
    return this.authService.getUserFromToken(data);
  }

  @MessagePattern('auth.logout')
  async logout(data: { token: string }) {
    // Cette méthode doit être implémentée dans le service
    // return this.authService.logout(data.token);
    return { message: 'Logout successful' };
  }

  @MessagePattern('auth.users.list')
  async getUsersList(data: { 
    token: string; 
    page?: number; 
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) {
    // Vérifier le token et les permissions
    const tokenData = await this.authService.getUserFromToken({ token: data.token });
    
    // Vérification que l'agenceId est disponible
    if (!tokenData?.user?.agencyId) {
      throw new Error('Invalid user token or missing agency ID');
    }
    
    // Récupérer la liste des utilisateurs
    return this.usersService.findAll({
      page: data.page || 1,
      limit: data.limit || 10,
      role: data.role,
      status: data.status,
      search: data.search,
      agencyId: String(tokenData.user.agencyId)
    });
  }

  @MessagePattern('auth.users.get')
  async getUserById(data: { id: string, token: string }) {
    // Vérifier le token et les permissions
    const tokenData = await this.authService.getUserFromToken({ token: data.token });
    
    // Récupérer l'utilisateur par ID
    const user = await this.usersService.findById(data.id);
    
    // Vérifier que l'utilisateur appartient à la même agence
    if (user && typeof user === 'object' && 'agencyId' in user && user.agencyId !== tokenData.user.agencyId) {
      throw new Error('Unauthorized access to user data');
    }
    
    return { user };
  }

  @MessagePattern('auth.users.update')
  async updateUser(data: { 
    id: string, 
    token: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    role?: string,
    status?: string
  }) {
    // Vérifier le token et les permissions
    const tokenData = await this.authService.getUserFromToken({ token: data.token });
    
    // Récupérer l'utilisateur à mettre à jour
    const user = await this.usersService.findById(data.id);
    
    // Vérifier que l'utilisateur appartient à la même agence
    if (user && typeof user === 'object' && 'agencyId' in user && user.agencyId !== tokenData.user.agencyId) {
      throw new Error('Unauthorized access to user data');
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await this.usersService.update(data.id, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      status: data.status
    });
    
    return updatedUser;
  }

  @MessagePattern('auth.invite')
  async inviteUser(data: { 
    email: string, 
    firstName: string, 
    lastName: string, 
    role: string,
    token: string 
  }) {
    // Vérifier le token et les permissions
    const tokenData = await this.authService.getUserFromToken({ token: data.token });
    
    // Vérification que l'ID utilisateur est disponible
    if (!tokenData?.user?.id) {
      throw new Error('Invalid user token');
    }
    
    // Créer l'invitation
    const result = await this.usersService.inviteUser(
      String(tokenData.user.id), 
      {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      }
    );
    
    return result;
  }

  @MessagePattern('auth.users.delete')
  async deleteUser(data: { id: string, token: string }) {
    // Vérifier le token et les permissions
    const tokenData = await this.authService.getUserFromToken({ token: data.token });
    
    // Vérifier que l'utilisateur a les droits d'administrateur
    if (tokenData.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin privileges required');
    }
    
    // Récupérer l'utilisateur à supprimer
    const user = await this.usersService.findById(data.id);
    
    // Vérifier que l'utilisateur appartient à la même agence
    if (user && typeof user === 'object' && 'agencyId' in user && user.agencyId !== tokenData.user.agencyId) {
      throw new Error('Unauthorized access to user data');
    }
    
    // Supprimer l'utilisateur
    return await this.usersService.deleteUser(data.id);
  }
}
