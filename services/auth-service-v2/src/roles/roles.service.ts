import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize';

@Injectable()
export class RolesService {
  private readonly availableRoles = ['ADMIN', 'USER', 'MANAGER'];

  constructor(
    @Inject('SEQUELIZE') private sequelize: Sequelize,
  ) {}

  async getAllRoles() {
    const roles = await this.sequelize.query(`
      SELECT id, name, description
      FROM roles;
    `, {
      type: 'SELECT',
    });
    
    return roles;
  }

  async isValidRole(role: string): Promise<boolean> {
    return this.availableRoles.includes(role);
  }
}
