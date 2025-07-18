import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtUtils } from '../utils/jwt.utils';

@Controller()
export class TemplatesMessageHandler {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly jwtService: JwtService,
  ) {}

  @MessagePattern('templates.create')
  async create(@Payload() data: { createTemplateDto: CreateTemplateDto; token: string }) {
    try {
      const { createTemplateDto } = data;
      
      // Note: Pour les templates, nous n'avons pas besoin d'agencyId car ils sont globaux
      // mais on pourrait l'ajouter plus tard si nécessaire
      
      const template = await this.templatesService.create(createTemplateDto);
      return {
        status: 'success',
        data: template,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  @MessagePattern('templates.list')
  async findAll() {
    try {
      const templates = await this.templatesService.findAll();
      return {
        status: 'success',
        data: templates,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  @MessagePattern('templates.getById')
  async findOne(@Payload() data: { id: string }) {
    try {
      const template = await this.templatesService.findOne(data.id);
      return {
        status: 'success',
        data: template,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  @MessagePattern('templates.update')
  async update(@Payload() data: { id: string; updateTemplateDto: Partial<CreateTemplateDto>; token: string }) {
    try {
      // Vérification du token pour s'assurer que l'utilisateur a les droits
      if (!data.token) {
        throw new Error('Token is required');
      }
      
      // On pourrait vérifier les rôles ici si nécessaire
      
      const template = await this.templatesService.update(data.id, data.updateTemplateDto);
      return {
        status: 'success',
        data: template,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }

  @MessagePattern('templates.delete')
  async remove(@Payload() data: { id: string; token: string }) {
    try {
      // Vérification du token pour s'assurer que l'utilisateur a les droits
      if (!data.token) {
        throw new Error('Token is required');
      }
      
      // On pourrait vérifier les rôles ici si nécessaire
      
      await this.templatesService.remove(data.id);
      return {
        status: 'success',
        message: 'Template deleted successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    }
  }
}
