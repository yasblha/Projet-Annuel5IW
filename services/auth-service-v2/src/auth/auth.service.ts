import { Injectable, Inject, ConflictException, BadRequestException, InternalServerErrorException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Sequelize } from 'sequelize';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/interfaces/user.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { MailAdapter } from '../infrastructure/adapters/mail.adapter';
import { TokenUser } from './interfaces/token-user.interface';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 30;
  private readonly PASSWORD_EXPIRY_DAYS = 60;

  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    private readonly mailAdapter: MailAdapter,
    @Inject('SEQUELIZE') private sequelize: Sequelize,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate role if provided
    if (registerDto.role && !(await this.rolesService.isValidRole(registerDto.role))) {
      throw new BadRequestException('Invalid role');
    }

    // Validate password strength
    this.validatePasswordStrength(registerDto.password);

    // Generate UUID for agency
    const agencyId = uuidv4();

    // Create admin user and agency
    const user = await this.usersService.createAdmin(agencyId, registerDto);
    
    // Vérifier que l'utilisateur a été créé correctement
    if (!user) {
      throw new InternalServerErrorException('Failed to create user');
    }

    // Créer un objet User correctement typé
    const userObj: User = {
      id: user && typeof user === 'object' && 'id' in user ? String(user.id) : null,
      email: user && typeof user === 'object' && 'email' in user ? String(user.email) : null,
      firstName: user && typeof user === 'object' && 'firstName' in user ? String(user.firstName) : null,
      lastName: user && typeof user === 'object' && 'lastName' in user ? String(user.lastName) : null,
      role: user && typeof user === 'object' && 'role' in user ? String(user.role) : null,
      agencyId: user && typeof user === 'object' && 'agencyId' in user ? String(user.agencyId) : null,
      status: user && typeof user === 'object' && 'status' in user ? String(user.status) : null
    };

    // Generate JWT token
    const token = this.generateToken(userObj);

    // Envoyer un email de confirmation d'inscription avec le token d'activation
    try {
      // Récupérer directement l'utilisateur depuis la base de données pour être sûr d'avoir le token
      const dbUser = await this.usersService.findByEmail(userObj.email);
      
      if (!dbUser) {
        throw new Error('User not found after registration');
      }
      
      this.mailAdapter.sendRegistrationConfirmation(
        userObj.email,
        userObj.firstName,
        userObj.lastName,
        (dbUser as any)?.activationToken || ''
      );
      console.log(`[INFO] Registration confirmation email sent to ${userObj.email}`);
    } catch (error) {
      console.error(`[ERROR] Failed to send registration confirmation email: ${error.message}`);
      // Ne pas bloquer le flux si l'email échoue
    }

    return {
      user: {
        id: userObj.id,
        email: userObj.email,
        role: userObj.role,
      },
      token,
    };
  }

  async login({ email, password }: LoginDto) {
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked due to too many failed attempts
    if (user && typeof user === 'object' && 'id' in user) {
      const isLocked = await this.isAccountLocked(String(user.id));
      if (isLocked) {
        throw new UnauthorizedException(`Account locked due to too many failed login attempts. Please try again after ${this.LOCKOUT_DURATION_MINUTES} minutes.`);
      }
    }

    // Check if account is active
    if (user && typeof user === 'object' && 'status' in user && user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Check if password is correct
    const isPasswordValid = user && typeof user === 'object' && 'password' in user ? 
      await bcrypt.compare(password, String(user.password)) : false;
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      if (user && typeof user === 'object' && 'id' in user) {
        await this.incrementFailedLoginAttempts(String(user.id));
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts
    if (user && typeof user === 'object' && 'id' in user) {
      await this.resetFailedLoginAttempts(String(user.id));
    }

    // Check if password has expired
    const passwordLastChanged = user && typeof user === 'object' && 'passwordLastChanged' in user ? 
      new Date(String(user.passwordLastChanged)) : new Date();
    const passwordExpiryDate = new Date(passwordLastChanged);
    passwordExpiryDate.setDate(passwordExpiryDate.getDate() + this.PASSWORD_EXPIRY_DAYS);

    const isPasswordExpired = new Date() > passwordExpiryDate;

    // Create a proper User object
    const userObj: User = {
      id: user && typeof user === 'object' && 'id' in user ? String(user.id) : null,
      email: user && typeof user === 'object' && 'email' in user ? String(user.email) : null,
      firstName: user && typeof user === 'object' && 'firstName' in user ? String(user.firstName) : null,
      lastName: user && typeof user === 'object' && 'lastName' in user ? String(user.lastName) : null,
      role: user && typeof user === 'object' && 'role' in user ? String(user.role) : null,
      agencyId: user && typeof user === 'object' && 'agencyId' in user ? String(user.agencyId) : null,
      status: user && typeof user === 'object' && 'status' in user ? String(user.status) : null
    };

    // Generate JWT token
    const token = this.generateToken(userObj);

    return {
      user: {
        id: userObj.id,
        email: userObj.email,
        role: userObj.role,
        passwordExpired: isPasswordExpired,
      },
      token,
    };
  }

  async activateAccount(activateAccountDto: ActivateAccountDto) {
    const { token, password } = activateAccountDto;

    // Validate password strength
    this.validatePasswordStrength(password);

    // Activate account
    const user = await this.usersService.activateAccount(token, password);

    if (!user) {
      throw new BadRequestException('Failed to activate account');
    }

    // Ensure user is properly typed for token generation
    const userObj: User = {
      id: user && typeof user === 'object' && 'id' in user ? String(user.id) : null,
      email: user && typeof user === 'object' && 'email' in user ? String(user.email) : null,
      firstName: user && typeof user === 'object' && 'firstName' in user ? String(user.firstName) : null,
      lastName: user && typeof user === 'object' && 'lastName' in user ? String(user.lastName) : null,
      role: user && typeof user === 'object' && 'role' in user ? String(user.role) : null,
      agencyId: user && typeof user === 'object' && 'agencyId' in user ? String(user.agencyId) : null,
      status: 'ACTIVE'
    };

    // Generate JWT token
    const jwtToken = this.generateToken(userObj);

    return {
      user: {
        id: userObj.id,
        email: userObj.email,
        role: userObj.role,
      },
      token: jwtToken,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Generate password reset token
    await this.usersService.generatePasswordResetToken(email);

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    // Validate password strength
    this.validatePasswordStrength(password);

    // Reset password
    await this.usersService.resetPassword(token, password);

    return { message: 'Password has been reset successfully' };
  }

  async refreshToken({ userId }: { userId: string }) {
    // Find user by ID
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if account is active
    if (user && typeof user === 'object' && 'status' in user && user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Generate new JWT token
    const userObj: User = {
      id: user && typeof user === 'object' && 'id' in user ? String(user.id) : null,
      email: user && typeof user === 'object' && 'email' in user ? String(user.email) : null,
      firstName: user && typeof user === 'object' && 'firstName' in user ? String(user.firstName) : null,
      lastName: user && typeof user === 'object' && 'lastName' in user ? String(user.lastName) : null,
      role: user && typeof user === 'object' && 'role' in user ? String(user.role) : null,
      agencyId: user && typeof user === 'object' && 'agencyId' in user ? String(user.agencyId) : null,
      status: user && typeof user === 'object' && 'status' in user ? String(user.status) : null
    };
    
    const access_token = this.generateToken(userObj);

    return {
      access_token,
      user: {
        id: userObj.id,
        email: userObj.email,
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        role: userObj.role,
      }
    };
  }

  async getUserFromToken(data: { token: string }): Promise<TokenUser> {
    try {
      const payload = this.jwtService.verify(data.token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');
      if (user && typeof user === 'object' && 'status' in user && user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');
      
      // Extraire et convertir les dates de manière sûre
      let createdAt = null;
      let updatedAt = null;
      
      if (user && typeof user === 'object' && 'createdAt' in user && user.createdAt) {
        try {
          createdAt = new Date(String(user.createdAt));
        } catch (e) {
          console.error('Erreur lors de la conversion de createdAt en Date:', e);
        }
      }
      
      if (user && typeof user === 'object' && 'updatedAt' in user && user.updatedAt) {
        try {
          updatedAt = new Date(String(user.updatedAt));
        } catch (e) {
          console.error('Erreur lors de la conversion de updatedAt en Date:', e);
        }
      }
      
      return { 
        user: { 
          id: user && typeof user === 'object' && 'id' in user ? String(user.id) : null, 
          email: user && typeof user === 'object' && 'email' in user ? String(user.email) : null, 
          firstName: user && typeof user === 'object' && 'firstName' in user ? String(user.firstName) : null, 
          lastName: user && typeof user === 'object' && 'lastName' in user ? String(user.lastName) : null, 
          role: user && typeof user === 'object' && 'role' in user ? String(user.role) : null, 
          agencyId: user && typeof user === 'object' && 'agencyId' in user ? String(user.agencyId) : null, 
          status: user && typeof user === 'object' && 'status' in user ? String(user.status) : null, 
          createdAt: createdAt,
          updatedAt: updatedAt
        } 
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      agencyId: user.agencyId,
    };
    
    return this.jwtService.sign(payload);
  }

  private validatePasswordStrength(password: string) {
    // Password must be at least 12 characters long
    if (password.length < 12) {
      throw new BadRequestException('Password must be at least 12 characters long');
    }

    // Password must contain at least one digit
    if (!/\d/.test(password)) {
      throw new BadRequestException('Password must contain at least one digit');
    }

    // Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    // Password must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    // Password must contain at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }

  private async isAccountLocked(userId: string): Promise<boolean> {
    const [result] = await this.sequelize.query(`
      SELECT COUNT(*) as attempts, MAX(created_at) as last_attempt
      FROM login_attempts
      WHERE user_id = :userId AND successful = false
      AND created_at > NOW() - INTERVAL '${this.LOCKOUT_DURATION_MINUTES} minutes'
    `, {
      replacements: { userId },
      type: 'SELECT',
    });

    if (!result) {
      return false;
    }

    return result && typeof result === 'object' && 'attempts' in result ? 
      parseInt(result.attempts as string, 10) >= this.MAX_LOGIN_ATTEMPTS : false;
  }

  private async incrementFailedLoginAttempts(userId: string) {
    // Create login_attempts table if it doesn't exist
    await this.sequelize.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        successful BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Record failed login attempt
    await this.sequelize.query(`
      INSERT INTO login_attempts (user_id, successful)
      VALUES (:userId, false);
    `, {
      replacements: { userId },
    });
  }

  private async resetFailedLoginAttempts(userId: string) {
    // Record successful login attempt
    await this.sequelize.query(`
      INSERT INTO login_attempts (user_id, successful)
      VALUES (:userId, true);
    `, {
      replacements: { userId },
    });
  }
}
