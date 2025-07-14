import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { FactureService } from '../services/facture.service';
import { FactureMapper } from '../mappers/facture.mapper';

@Controller()
export class FactureMessageController {
  constructor(private readonly factureService: FactureService) {}

  @MessagePattern('facture.findById')
  async findById(@Payload() data: { id: string; tenantId: string }) {
    const facture = await this.factureService.findById(data.id, data.tenantId);
    return facture ? FactureMapper.toResponse(facture) : null;
  }

  @MessagePattern('facture.findByClientId')
  async findByClientId(@Payload() data: { clientId: string; tenantId: string }) {
    const factures = await this.factureService.findByClientId(data.clientId, data.tenantId);
    return factures.map(facture => FactureMapper.toResponse(facture));
  }

  @MessagePattern('facture.findByContratId')
  async findByContratId(@Payload() data: { contratId: string; tenantId: string }) {
    const factures = await this.factureService.findByContratId(data.contratId, data.tenantId);
    return factures.map(facture => FactureMapper.toResponse(facture));
  }

  @MessagePattern('facture.findUnpaid')
  async findUnpaid(@Payload() data: { tenantId: string }) {
    const factures = await this.factureService.findUnpaid(data.tenantId);
    return factures.map(facture => FactureMapper.toResponse(facture));
  }

  @MessagePattern('facture.create')
  async create(@Payload() data: { createFactureDto: any; context: any }) {
    return this.factureService.create(data.createFactureDto, data.context);
  }

  @MessagePattern('facture.emettre')
  async emettre(@Payload() data: { id: string; context: any }) {
    return this.factureService.emettreFacture(data.id, data.context);
  }

  @MessagePattern('facture.annuler')
  async annuler(@Payload() data: { id: string; context: any }) {
    return this.factureService.annulerFacture(data.id, data.context);
  }

  @MessagePattern('facture.enregistrerPaiement')
  async enregistrerPaiement(@Payload() data: { id: string; paiementDto: any; context: any }) {
    return this.factureService.enregistrerPaiement(data.id, data.paiementDto, data.context);
  }

  @MessagePattern('facture.relancer')
  async relancerFacturesImpayees(@Payload() data: { options: any }) {
    return this.factureService.relancerFacturesImpayees(data.options);
  }

  @MessagePattern('facture.generatePDF')
  async generatePDF(@Payload() data: { factureId: string; context: any }) {
    return this.factureService.generatePDFForInvoice(data.factureId, data.context);
  }

  @EventPattern('facture.notification')
  async envoyerNotification(@Payload() data: { id: string; type: string; metaData: any }) {
    await this.factureService.envoyerNotificationManuelle(
      data.id, 
      data.type, 
      data.metaData
    );
  }
}
