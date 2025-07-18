"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
let UsersService = class UsersService {
    constructor(sequelize, mailerClient) {
        this.sequelize = sequelize;
        this.mailerClient = mailerClient;
    }
    async createAdmin(agencyId, registerDto) {
        const { email, password, firstName, lastName, agencyName } = registerDto;
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
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
        const hashedPassword = await bcrypt.hash(password, 10);
        const activationToken = (0, uuid_1.v4)();
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
    async findByEmail(email) {
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
    async findById(id) {
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
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async inviteUser(adminId, inviteDto) {
        const { email, role, firstName, lastName } = inviteDto;
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const admin = await this.findById(adminId);
        const adminAgencyId = admin && typeof admin === 'object' && 'agencyId' in admin ? admin.agencyId : null;
        if (!adminAgencyId) {
            throw new common_1.BadRequestException('Admin agency not found');
        }
        const activationToken = (0, uuid_1.v4)();
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
    async activateAccount(token, password) {
        const [user] = await this.sequelize.query(`
      SELECT id, email, role, agency_id as "agencyId", status
      FROM users
      WHERE activation_token = :token;
    `, {
            replacements: { token },
            type: 'SELECT',
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid activation token');
        }
        if (user && typeof user === 'object' && 'status' in user && user.status !== 'PENDING') {
            throw new common_1.BadRequestException('Account is already activated');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
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
    async generatePasswordResetToken(email) {
        const user = await this.findByEmail(email);
        if (!user) {
            return;
        }
        const resetToken = (0, uuid_1.v4)();
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
        this.mailerClient.emit('send_password_reset', {
            email,
            resetToken,
        });
        return {
            message: 'Password reset email sent',
        };
    }
    async resetPassword(token, password) {
        const [user] = await this.sequelize.query(`
      SELECT id, email, role, status
      FROM users
      WHERE reset_token = :token;
    `, {
            replacements: { token },
            type: 'SELECT',
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid reset token');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
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
    async findAllByAgency(agencyId) {
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
    async findAll({ page = 1, limit = 10, role, status, search, agencyId }) {
        const offset = (page - 1) * limit;
        let whereConditions = ["agency_id = :agencyId"];
        const replacements = { agencyId, limit, offset };
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
        const countResult = await this.sequelize.query(`
      SELECT COUNT(*)::integer as count
      FROM users
      ${whereClause};
    `, {
            replacements,
            type: 'SELECT',
        });
        const usersList = Array.isArray(usersResult) ? usersResult : [];
        const totalCount = countResult && countResult[0] &&
            typeof countResult[0] === 'object' && 'count' in countResult[0] ?
            Number(countResult[0].count) : 0;
        return {
            users: usersList,
            meta: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
            },
        };
    }
    async update(id, updateData) {
        const user = await this.findById(id);
        const updateFields = [];
        const replacements = { id };
        if (updateData.firstName !== undefined) {
            updateFields.push('first_name = :firstName');
            replacements.firstName = updateData.firstName;
        }
        if (updateData.lastName !== undefined) {
            updateFields.push('last_name = :lastName');
            replacements.lastName = updateData.lastName;
        }
        if (updateData.email !== undefined) {
            const existingUser = await this.findByEmail(updateData.email);
            if (existingUser && typeof existingUser === 'object' && 'id' in existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException('Email is already in use');
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
        if (updateFields.length === 0) {
            return user;
        }
        await this.sequelize.query(`
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = :id;
    `, { replacements });
        return this.findById(id);
    }
    async deleteUser(id) {
        await this.findById(id);
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SEQUELIZE')),
    __param(1, (0, common_1.Inject)('MAILER_SERVICE')),
    __metadata("design:paramtypes", [sequelize_1.Sequelize,
        microservices_1.ClientProxy])
], UsersService);
//# sourceMappingURL=users.service.js.map