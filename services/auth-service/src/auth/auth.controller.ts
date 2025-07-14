import { Controller, Post, Body, Req, UseGuards, Patch, Request, ForbiddenException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import { RegisterDto } from '@application/dtos/auth/register.dto';
import { LoginDto } from '@application/dtos/auth/login.dto';
import { mapDtoToUser, mapJwtToUser } from '@application/mappers/user.mapper';
import { ApiTags, ApiBody, ApiBearerAuth, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { AuthGuard } from '@infrastructure/guards/auth.guard';
import { RolesGuard } from '@infrastructure/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { UpdateProfileDto } from '@application/dtos/auth/update-profile.dto';
import { addTokenToBlacklist } from '@infrastructure/guards/auth.guard';
import { UserRole } from '@Database/models/enums/userRole.enum';

// DTOs pour Swagger avec exemples
export class RegisterDtoSwagger {
  @ApiProperty({
    example: 'Dupont',
    description: 'Nom de famille de l\'utilisateur'
  })
  nom: string;

  @ApiProperty({
    example: 'Jean',
    description: 'Prénom de l\'utilisateur'
  })
  prenom: string;

  @ApiProperty({
    example: 'jean.dupont@example.com',
    description: 'Adresse email unique de l\'utilisateur'
  })
  email: string;

  @ApiProperty({
    example: 'MotDePasse123!',
    description: 'Mot de passe (min 12 caractères, majuscule, minuscule, chiffre, symbole)'
  })
  motDePasse: string;

  @ApiProperty({
    example: '0123456789',
    description: 'Numéro de téléphone (optionnel)',
    required: false
  })
  telephone?: string;

  @ApiProperty({
    example: 'CLIENT',
    description: 'Rôle de l\'utilisateur dans le système',
    enum: ['CLIENT', 'ADMIN', 'TECHNICIEN', 'COMMERCIAL', 'SUPPORT', 'COMPTABLE', 'MANAGER'],
    required: false
  })
  role?: 'CLIENT' | 'ADMIN' | 'TECHNICIEN' | 'COMMERCIAL' | 'SUPPORT' | 'COMPTABLE' | 'MANAGER';

  @ApiProperty({
    example: 'tenant123',
    description: 'Identifiant du tenant (optionnel)',
    required: false
  })
  tenantId?: string;
}

export class LoginDtoSwagger {
  @ApiProperty({
    example: 'jean.dupont@example.com',
    description: 'Adresse email de l\'utilisateur'
  })
  email: string;

  @ApiProperty({
    example: 'MotDePasse123!',
    description: 'Mot de passe de l\'utilisateur'
  })
  password: string;
}

export class UserResponseSwagger {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  email: string;

  @ApiProperty({ example: 'Dupont' })
  nom: string;

  @ApiProperty({ example: 'Jean' })
  prenom: string;

  @ApiProperty({ example: 'CLIENT' })
  role: string;

  @ApiProperty({ example: '0123456789', required: false })
  telephone?: string;

  @ApiProperty({ example: 'tenant123', required: false })
  tenantId?: string;

  @ApiProperty({ example: 'EN_ATTENTE_VALIDATION' })
  statut: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly UsersService: UsersService, private readonly jwtService: JwtService) {}

    // Handlers pour les messages TCP (API Gateway)
    @MessagePattern('auth.register')
    async handleRegister(@Payload() data: RegisterDto) {
        try {
            const user = await this.UsersService.registerFromInterface(mapDtoToUser(data));
            return {
                success: true,
                data: user,
                message: 'Utilisateur créé avec succès'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                status: error.status || 500
            };
        }
    }

    @MessagePattern('auth.login')
    async handleLogin(@Payload() data: { email: string; password: string }) {
        try {
            const user = await this.UsersService.loginUser(data.email, data.password);
            // Générer un JWT (à adapter selon ta config)
            const payload = { sub: user.id, email: user.email, role: user.role };
            const access_token = this.jwtService.sign(payload);
            return {
                success: true,
                data: {
                    access_token,
                    user
                },
                message: 'Connexion réussie'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                status: error.status || 401
            };
        }
    }

    @MessagePattern('auth.admin.register')
    async handleAdminRegister(@Payload() data: { admin: any; userData: RegisterDto }) {
        try {
            const admin = mapJwtToUser(data.admin);
            const newUser = mapDtoToUser(data.userData);
            const user = await this.UsersService.registerFromAdmin(admin, newUser);
            return {
                success: true,
                data: user,
                message: 'Utilisateur créé par admin avec succès'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                status: error.status || 500
            };
        }
    }

    @MessagePattern('auth.invite')
    async handleInvite(@Payload() data: { userId: number }) {
        try {
            const token = await this.UsersService.inviteUser(data.userId);
            return { success: true, token };
        } catch (error) {
            return { success: false, error: error.message, status: 500 };
        }
    }

    @MessagePattern('auth.confirm')
    async handleConfirm(@Payload() data: { token: string; password: string }) {
        try {
            const user = await this.UsersService.confirmInvitation(data.token, data.password);
            const payload = { sub: user.id, email: user.email, role: user.role };
            const access_token = this.jwtService.sign(payload);
            return { success: true, data: { access_token, user } };
        } catch (error) {
            return { success: false, error: error.message, status: 400 };
        }
    }

    @MessagePattern('auth.activate')
    async handleActivate(@Payload() data: { token: string; password: string }) {
        try {
            const user = await this.UsersService.activateEmail(data.token, data.password);
            const payload = { sub: user.id, email: user.email, role: user.role };
            const access_token = this.jwtService.sign(payload);
            return { success: true, data: { access_token, user } };
        } catch (error) {
            return { success: false, error: error.message, status: 400 };
        }
    }

    @MessagePattern('auth.reset-password')
    async handleResetPassword(@Payload() data: { token: string; newPassword: string }) {
        try {
            const result = await this.UsersService.resetPassword(data.token, data.newPassword);
            return { success: true, message: result.message };
        } catch (error) {
            return { success: false, error: error.message, status: 400 };
        }
    }

    @MessagePattern('auth.refresh')
    async handleRefresh(@Payload() data: { userId: number }) {
        try {
            const user = await this.UsersService.getUserById(data.userId);
            const payload = { sub: user.id, email: user.email, role: user.role };
            const access_token = this.jwtService.sign(payload);
            return { success: true, data: { access_token, user } };
        } catch (error) {
            return { success: false, error: error.message, status: 401 };
        }
    }

    @MessagePattern('auth.me')
    async handleMe(@Payload() data: { userId: number }) {
        try {
            const user = await this.UsersService.getUserById(data.userId);
            return { success: true, data: user };
        } catch (error) {
            return { success: false, error: error.message, status: 401 };
        }
    }

    @MessagePattern('auth.logout')
    async handleLogout(@Payload() data: { userId: number }, @Req() req) {
        try {
            // Récupérer le token courant
            const authHeader = req?.headers?.authorization;
            if (authHeader) {
                const [type, token] = authHeader.split(' ');
                if (type === 'Bearer' && token) {
                    addTokenToBlacklist(token);
                }
            }
            return { success: true, message: 'Déconnexion réussie' };
        } catch (error) {
            return { success: false, error: error.message, status: 500 };
        }
    }

    @MessagePattern('auth.verify')
    async handleVerify(@Payload() data: { token: string }) {
        try {
            // Décoder et vérifier le JWT
            const payload: any = this.jwtService.verify(data.token, {
                secret: process.env.JWT_SECRET || 'secret-key',
            });

            // Tenter de récupérer l'utilisateur complet pour obtenir tenantId et autres infos manquantes
            let user: any;
            try {
                user = await this.UsersService.getUserById(payload.sub as any);
            } catch (e) {
                // Si non trouvé ou erreur, on se contente du payload
                user = null;
            }

            return {
                id: user?.id ?? payload.sub,
                email: user?.email ?? payload.email,
                role: user?.role ?? payload.role,
                tenantId: user?.tenantId ?? payload.tenantId ?? null,
            };
        } catch (error) {
            return null;
        }
    }

    // Handlers HTTP (accès direct)
    @Post('register')
    @ApiOperation({ 
        summary: 'Inscription d\'un nouvel utilisateur',
        description: 'Crée un nouveau compte utilisateur avec validation des données'
    })
    @ApiBody({ 
        type: RegisterDtoSwagger,
        description: 'Données d\'inscription de l\'utilisateur',
        examples: {
            client: {
                summary: 'Inscription Client',
                description: 'Exemple d\'inscription d\'un client',
                value: {
                    nom: 'Dupont',
                    prenom: 'Jean',
                    email: 'jean.dupont@example.com',
                    motDePasse: 'MotDePasse123!',
                    telephone: '0123456789',
                    tenantId: 'client-tenant-001'
                }
            },
            admin: {
                summary: 'Inscription Administrateur',
                description: 'Exemple d\'inscription d\'un administrateur',
                value: {
                    nom: 'Martin',
                    prenom: 'Sophie',
                    email: 'sophie.martin@example.com',
                    motDePasse: 'AdminPass456!',
                    telephone: '0987654321',
                    role: 'ADMIN',
                    tenantId: 'admin-tenant-001'
                }
            },
            technicien: {
                summary: 'Inscription Technicien',
                description: 'Exemple d\'inscription d\'un technicien',
                value: {
                    nom: 'Bernard',
                    prenom: 'Pierre',
                    email: 'pierre.bernard@example.com',
                    motDePasse: 'TechPass789!',
                    telephone: '0555666777',
                    role: 'TECHNICIEN',
                    tenantId: 'tech-tenant-001'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Utilisateur créé avec succès',
        type: UserResponseSwagger
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Données invalides'
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Email déjà utilisé'
    })
    registerPublic(@Body() dto: RegisterDto) {
        return this.UsersService.registerFromInterface(mapDtoToUser(dto));
    }

    @Post('admin/register')
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Inscription par un administrateur',
        description: 'Permet à un administrateur de créer un nouveau compte utilisateur'
    })
    @ApiBody({ 
        type: RegisterDtoSwagger,
        description: 'Données d\'inscription de l\'utilisateur'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Utilisateur créé par admin',
        type: UserResponseSwagger
    })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTEUR)
    registerByAdmin(@Req() req, @Body() dto: RegisterDto) {
        const admin = mapJwtToUser(req.user);
        const newUser = mapDtoToUser(dto);
        return this.UsersService.registerFromAdmin(admin, newUser);
    }

    @Post('login')
    @ApiOperation({ summary: 'Connexion' })
    login(@Body() dto: LoginDto) {
        return this.handleLogin(dto);
    }

    @Post('invite')
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTEUR)
    invite(@Body('userId') userId: number) {
        return this.UsersService.inviteUser(userId);
    }

    @Post('confirm')
    confirm(@Body() body: { token: string; password: string }) {
        return this.UsersService.confirmInvitation(body.token, body.password);
    }

    @Post('activate')
    activate(@Body() body: { token: string; password: string }) {
        return this.UsersService.activateEmail(body.token, body.password);
    }

    @Post('debug-status')
    debugStatus(@Body() body: { email: string }) {
        if (process.env.NODE_ENV === 'production') {
            throw new ForbiddenException('Route disabled in production');
        }
        return this.UsersService.debugUserStatus(body.email);
    }

    @Patch('profile')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Mise à jour du profil utilisateur connecté' })
    @ApiBody({ type: UpdateProfileDto })
    @ApiResponse({ status: 200, description: 'Profil mis à jour', type: UserResponseSwagger })
    async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
        // L'ID utilisateur est dans le JWT (req.user.sub)
        const userId = req.user?.sub;
        if (!userId) throw new Error('Utilisateur non authentifié');
        const user = await this.UsersService.updateProfile(Number(userId), dto);
        return { success: true, data: user };
    }
}
