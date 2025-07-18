import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from '../auth/dto/register.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { Sequelize } from 'sequelize';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('SEQUELIZE') private sequelize: Sequelize,
    @Inject('MAILER_SERVICE') private mailerClient: ClientProxy,
  ) {}

  async createAdmin(agencyId: string, registerDto: RegisterDto) {
    const { email, password, firstName, lastName, agencyName } = registerDto;
    
    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    
    // Create agency
    const [agency] = await this.sequelize.query(`
      INSERT INTO agencies (id, name)
      VALUES (:agencyId, :name)
      RETURNING id, name;
    `, {
      replacements: {
        agencyId,
        name: agencyName,
      },
      type: 'SELECT',
    });
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Générer un token d'activation
    const activationToken = uuidv4();
    
    // Create admin user with PENDING status and activation token
    const [user] = await this.sequelize.query(`
      INSERT INTO users (email, password, first_name, last_name, role, status, agency_id, activation_token)
      VALUES (:email, :password, :firstName, :lastName, 'ADMIN', 'PENDING', :agencyId, :activationToken)
      RETURNING id, email, role, agency_id as "agencyId", status, activation_token as "activationToken";
    `, {
      replacements: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        agencyId,
        activationToken,
      },
      type: 'SELECT',
    });
    
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.sequelize.query(`
      SELECT id, email, password, first_name as "firstName", last_name as "lastName", 
             role, status, agency_id as "agencyId", activation_token as "activationToken",
             reset_token as "resetToken", password_last_changed as "passwordLastChanged"
      FROM users
      WHERE email = :email;
    `, {
      replacements: { email },
      type: 'SELECT',
    });
    
    return user || null;
  }

  async findById(id: string) {
    const [user] = await this.sequelize.query(`
      SELECT id, email, first_name as "firstName", last_name as "lastName", 
             role, status, agency_id as "agencyId"
      FROM users
      WHERE id = :id;
    `, {
      replacements: { id },
      type: 'SELECT',
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async inviteUser(adminId: string, inviteDto: InviteUserDto) {
    const { email, role, firstName, lastName } = inviteDto;
    
    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    
    // Get admin user to get agency_id
    const admin = await this.findById(adminId);
    const adminAgencyId = admin && typeof admin === 'object' && 'agencyId' in admin ? admin.agencyId : null;
    
    if (!adminAgencyId) {
      throw new BadRequestException('Admin agency not found');
    }
    
    // Generate activation token
    const activationToken = uuidv4();
    
    // Create user with PENDING status
    const [user] = await this.sequelize.query(`
      INSERT INTO users (email, role, status, agency_id, activation_token, first_name, last_name)
      VALUES (:email, :role, 'PENDING', :agencyId, :activationToken, :firstName, :lastName)
      RETURNING id, email, role, agency_id as "agencyId", status;
    `, {
      replacements: {
        email,
        role,
        agencyId: adminAgencyId,
        activationToken,
        firstName,
        lastName
      },
      type: 'SELECT',
    });
    
    // Send invitation email
    this.mailerClient.emit('user.invite', {
      to: email,
      firstname: firstName,
      token: activationToken,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080'
    });
    
    return {
      message: 'Invitation sent successfully',
      user: {
        id: user && typeof user === 'object' && 'id' in user ? user.id : null,
        email: user && typeof user === 'object' && 'email' in user ? user.email : null,
        role: user && typeof user === 'object' && 'role' in user ? user.role : null,
        status: user && typeof user === 'object' && 'status' in user ? user.status : null,
      },
    };
  }

  async activateAccount(token: string, password: string) {
    // Find user by activation token
    const [user] = await this.sequelize.query(`
      SELECT id, email, role, agency_id as "agencyId", status
      FROM users
      WHERE activation_token = :token;
    `, {
      replacements: { token },
      type: 'SELECT',
    });
    
    if (!user) {
      throw new BadRequestException('Invalid activation token');
    }
    
    if (user && typeof user === 'object' && 'status' in user && user.status !== 'PENDING') {
      throw new BadRequestException('Account is already activated');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user status to ACTIVE and set password
    await this.sequelize.query(`
      UPDATE users
      SET status = 'ACTIVE', password = :password, activation_token = NULL, password_last_changed = CURRENT_TIMESTAMP
      WHERE id = :id;
    `, {
      replacements: {
        id: user && typeof user === 'object' && 'id' in user ? user.id : null,
        password: hashedPassword,
      },
    });
    
    return {
      id: user && typeof user === 'object' && 'id' in user ? user.id : null,
      email: user && typeof user === 'object' && 'email' in user ? user.email : null,
      role: user && typeof user === 'object' && 'role' in user ? user.role : null,
      status: 'ACTIVE',
      agencyId: user && typeof user === 'object' && 'agencyId' in user ? user.agencyId : null,
    };
  }

  async generatePasswordResetToken(email: string) {
    // Find user by email
    const user = await this.findByEmail(email);
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return;
    }
    
    // Generate reset token
    const resetToken = uuidv4();
    
    // Update user with reset token
    await this.sequelize.query(`
      UPDATE users
      SET reset_token = :resetToken
      WHERE id = :id;
    `, {
      replacements: {
        id: user && typeof user === 'object' && 'id' in user ? user.id : null,
        resetToken,
      },
    });
    
    // Send password reset email
    this.mailerClient.emit('send_password_reset', {
      email,
      resetToken,
    });
    
    return {
      message: 'Password reset email sent',
    };
  }

  async resetPassword(token: string, password: string) {
    // Find user by reset token
    const [user] = await this.sequelize.query(`
      SELECT id, email, role, status
      FROM users
      WHERE reset_token = :token;
    `, {
      replacements: { token },
      type: 'SELECT',
    });
    
    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user password
    await this.sequelize.query(`
      UPDATE users
      SET password = :password, reset_token = NULL, password_last_changed = CURRENT_TIMESTAMP
      WHERE id = :id;
    `, {
      replacements: {
        id: user && typeof user === 'object' && 'id' in user ? user.id : null,
        password: hashedPassword,
      },
    });
    
    return {
      message: 'Password reset successfully',
      user: {
        id: user && typeof user === 'object' && 'id' in user ? user.id : null,
        email: user && typeof user === 'object' && 'email' in user ? user.email : null,
        role: user && typeof user === 'object' && 'role' in user ? user.role : null,
      },
    };
  }

  async findAllByAgency(agencyId: string) {
    const [users] = await this.sequelize.query(`
      SELECT id, email, first_name as "firstName", last_name as "lastName", 
             role, status, agency_id as "agencyId", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE agency_id = :agencyId
      ORDER BY created_at DESC;
    `, {
      replacements: { agencyId },
      type: 'SELECT',
    });
    
    return Array.isArray(users) ? users.map(user => ({
      id: user && typeof user === 'object' && 'id' in user ? user.id : null,
      email: user && typeof user === 'object' && 'email' in user ? user.email : null,
      firstName: user && typeof user === 'object' && 'firstName' in user ? user.firstName : null,
      lastName: user && typeof user === 'object' && 'lastName' in user ? user.lastName : null,
      role: user && typeof user === 'object' && 'role' in user ? user.role : null,
      status: user && typeof user === 'object' && 'status' in user ? user.status : null,
      agencyId: user && typeof user === 'object' && 'agencyId' in user ? user.agencyId : null,
      createdAt: user && typeof user === 'object' && 'createdAt' in user ? user.createdAt : null,
      updatedAt: user && typeof user === 'object' && 'updatedAt' in user ? user.updatedAt : null
    })) : [];
  }

  async findAll({ page = 1, limit = 10, role, status, search, agencyId }: { 
    page?: number; 
    limit?: number; 
    role?: string; 
    status?: string; 
    search?: string;
    agencyId?: string;
  }) {
    const offset = (page - 1) * limit;
    
    let whereConditions = ["agency_id = :agencyId"];
    const replacements: any = { agencyId, limit, offset };
    
    if (role) {
      whereConditions.push("role = :role");
      replacements.role = role;
    }
    
    if (status) {
      whereConditions.push("status = :status");
      replacements.status = status;
    }
    
    if (search) {
      whereConditions.push("(email ILIKE :search OR first_name ILIKE :search OR last_name ILIKE :search)");
      replacements.search = `%${search}%`;
    }
    
    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";
    
    // Récupération des utilisateurs
    const usersResult = await this.sequelize.query(`
      SELECT id, email, first_name as "firstName", last_name as "lastName", 
             role, status, agency_id as "agencyId", created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT :limit
      OFFSET :offset;
    `, {
      replacements,
      type: 'SELECT',
    });
    
    // Récupération du nombre total d'utilisateurs
    const countResult = await this.sequelize.query(`
      SELECT COUNT(*)::integer as count
      FROM users
      ${whereClause};
    `, {
      replacements,
      type: 'SELECT',
    });
    
    // Extraction des résultats
    const usersList = Array.isArray(usersResult) ? usersResult : [];
    const totalCount = countResult && countResult[0] && 
                     typeof countResult[0] === 'object' && 'count' in countResult[0] ? 
                     Number(countResult[0].count) : 0;
    
    return {
      users: usersList, // S'assurer que c'est bien un tableau
      meta: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }

  async update(id: string, updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    status?: string;
  }) {
    // Vérifie si l'utilisateur existe
    const user = await this.findById(id);
    
    // Construit dynamiquement la requête SQL de mise à jour
    const updateFields = [];
    const replacements: any = { id };
    
    if (updateData.firstName !== undefined) {
      updateFields.push('first_name = :firstName');
      replacements.firstName = updateData.firstName;
    }
    
    if (updateData.lastName !== undefined) {
      updateFields.push('last_name = :lastName');
      replacements.lastName = updateData.lastName;
    }
    
    if (updateData.email !== undefined) {
      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const existingUser = await this.findByEmail(updateData.email);
      if (existingUser && typeof existingUser === 'object' && 'id' in existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already in use');
      }
      updateFields.push('email = :email');
      replacements.email = updateData.email;
    }
    
    if (updateData.role !== undefined) {
      updateFields.push('role = :role');
      replacements.role = updateData.role;
    }
    
    if (updateData.status !== undefined) {
      updateFields.push('status = :status');
      replacements.status = updateData.status;
    }
    
    // S'il n'y a rien à mettre à jour, retourne l'utilisateur actuel
    if (updateFields.length === 0) {
      return user;
    }
    
    // Exécute la requête de mise à jour
    await this.sequelize.query(`
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = :id;
    `, { replacements });
    
    // Récupère l'utilisateur mis à jour
    return this.findById(id);
  }

  async deleteUser(id: string) {
    // Vérifie si l'utilisateur existe
    await this.findById(id);
    
    // Supprime l'utilisateur de la base de données
    await this.sequelize.query(`
      DELETE FROM users
      WHERE id = :id
    `, {
      replacements: { id },
      type: 'DELETE',
    });
    
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
