import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AffaireService } from './affaire.service';
import { CreateAffaireDto } from './dto/create-affaire.dto';
import { ValidateAffaireDto } from './dto/validate-affaire.dto';

@Controller()
export class AffaireMicroservice {
  private readonly logger = new Logger(AffaireMicroservice.name);

  constructor(private readonly service: AffaireService) {}

  @MessagePattern('affaire.create')
  async create(@Payload() dto: CreateAffaireDto) {
    this.logger.log(`[affaire.create] ${JSON.stringify(dto)}`);
    return this.service.create(dto);
  }

  @MessagePattern('affaire.validate')
  async validate(@Payload() data: { id: string } & ValidateAffaireDto) {
    this.logger.log(`[affaire.validate] ${JSON.stringify(data)}`);
    const { id, ...dto } = data;
    return this.service.validate(id, dto);
  }

  @MessagePattern('affaire.findAll')
  async list(@Payload() filter: any) {
    return this.service.list(filter?.statut);
  }

  @MessagePattern('affaire.findById')
  async findById(@Payload() data: { id: string }) {
    return this.service.get(data.id);
  }
}
