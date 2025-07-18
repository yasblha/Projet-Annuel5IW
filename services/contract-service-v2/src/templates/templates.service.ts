import { Injectable, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CreateTemplateDto } from '../dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private sequelize: Sequelize) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<any> {
    const [template] = await this.sequelize.query(`
      INSERT INTO contract_templates (
        id,
        name,
        body_md,
        periodicity,
        price,
        created_at
      )
      VALUES (
        uuid_generate_v4(),
        :name,
        :bodyMd,
        :periodicity,
        :price,
        NOW()
      )
      RETURNING *;
    `, {
      replacements: {
        name: createTemplateDto.name,
        bodyMd: createTemplateDto.bodyMd,
        periodicity: createTemplateDto.periodicity,
        price: createTemplateDto.price,
      },
      type: 'SELECT',
    });

    return this.formatTemplate(template);
  }

  async findAll(): Promise<any[]> {
    const templates = await this.sequelize.query(`
      SELECT * FROM contract_templates
      ORDER BY created_at DESC;
    `, {
      type: 'SELECT',
    });

    return templates.map(template => this.formatTemplate(template));
  }

  async findOne(id: string): Promise<any> {
    const [template] = await this.sequelize.query(`
      SELECT * FROM contract_templates
      WHERE id = :id;
    `, {
      replacements: { id },
      type: 'SELECT',
    });

    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    return this.formatTemplate(template);
  }

  async update(id: string, updateTemplateDto: Partial<CreateTemplateDto>): Promise<any> {
    // Vérifier si le template existe
    await this.findOne(id);

    // Construire dynamiquement la requête de mise à jour
    let updateQuery = 'UPDATE contract_templates SET ';
    const updateFields = [];
    const replacements = { id };

    if (updateTemplateDto.name !== undefined) {
      updateFields.push('name = :name');
      replacements['name'] = updateTemplateDto.name;
    }

    if (updateTemplateDto.bodyMd !== undefined) {
      updateFields.push('body_md = :bodyMd');
      replacements['bodyMd'] = updateTemplateDto.bodyMd;
    }

    if (updateTemplateDto.periodicity !== undefined) {
      updateFields.push('periodicity = :periodicity');
      replacements['periodicity'] = updateTemplateDto.periodicity;
    }

    if (updateTemplateDto.price !== undefined) {
      updateFields.push('price = :price');
      replacements['price'] = updateTemplateDto.price;
    }

    // Si aucun champ à mettre à jour, retourner le template existant
    if (updateFields.length === 0) {
      return this.findOne(id);
    }

    updateQuery += updateFields.join(', ') + ' WHERE id = :id RETURNING *;';

    const [updatedTemplate] = await this.sequelize.query(updateQuery, {
      replacements,
      type: 'SELECT',
    });

    return this.formatTemplate(updatedTemplate);
  }

  async remove(id: string): Promise<void> {
    // Vérifier si le template existe
    await this.findOne(id);

    await this.sequelize.query(`
      DELETE FROM contract_templates
      WHERE id = :id;
    `, {
      replacements: { id },
      type: 'DELETE',
    });
  }

  private formatTemplate(template: any): any {
    return {
      id: template.id,
      name: template.name,
      bodyMd: template.body_md,
      periodicity: template.periodicity,
      price: parseFloat(template.price),
      createdAt: template.created_at,
    };
  }
}
