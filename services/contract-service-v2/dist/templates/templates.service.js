"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_typescript_1 = require("sequelize-typescript");
let TemplatesService = class TemplatesService {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }
    async create(createTemplateDto) {
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
    async findAll() {
        const templates = await this.sequelize.query(`
      SELECT * FROM contract_templates
      ORDER BY created_at DESC;
    `, {
            type: 'SELECT',
        });
        return templates.map(template => this.formatTemplate(template));
    }
    async findOne(id) {
        const [template] = await this.sequelize.query(`
      SELECT * FROM contract_templates
      WHERE id = :id;
    `, {
            replacements: { id },
            type: 'SELECT',
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with id ${id} not found`);
        }
        return this.formatTemplate(template);
    }
    async update(id, updateTemplateDto) {
        await this.findOne(id);
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
    async remove(id) {
        await this.findOne(id);
        await this.sequelize.query(`
      DELETE FROM contract_templates
      WHERE id = :id;
    `, {
            replacements: { id },
            type: 'DELETE',
        });
    }
    formatTemplate(template) {
        return {
            id: template.id,
            name: template.name,
            bodyMd: template.body_md,
            periodicity: template.periodicity,
            price: parseFloat(template.price),
            createdAt: template.created_at,
        };
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sequelize_typescript_1.Sequelize])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map