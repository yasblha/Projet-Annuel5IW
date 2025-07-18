import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CreateContractDto } from '../dto/create-contract.dto';
import { ValidateContractDto } from '../dto/validate-contract.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContractsService {
  constructor(private sequelize: Sequelize) {}

  async create(agencyId: string, createContractDto: CreateContractDto): Promise<any> {
    // Vérifier si le client existe
    const [client] = await this.sequelize.query(`
      SELECT * FROM clients WHERE id = :clientId AND agency_id = :agencyId
    `, {
      replacements: { 
        clientId: createContractDto.clientId,
        agencyId
      },
      type: 'SELECT',
    });

    if (!client) {
      throw new NotFoundException(`Client with id ${createContractDto.clientId} not found`);
    }

    // Générer une référence unique pour le contrat (CTR-YYYY-NNNN)
    const year = new Date().getFullYear();
    const countResult = await this.sequelize.query(`
      SELECT COUNT(*) as count FROM contracts WHERE reference LIKE :yearPrefix
    `, {
      replacements: { yearPrefix: `CTR-${year}-%` },
      type: 'SELECT',
    });
    
    const count = countResult[0]['count'] as number;
    const paddedNumber = (count + 1).toString().padStart(4, '0');
    const reference = `CTR-${year}-${paddedNumber}`;

    // Récupérer les détails du template
    const templateResult = await this.sequelize.query(`
      SELECT * FROM contract_templates WHERE id = :templateId
    `, {
      replacements: { templateId: createContractDto.templateId },
      type: 'SELECT',
    });
    
    if (!templateResult || !templateResult[0]) {
      throw new NotFoundException(`Template with id ${createContractDto.templateId} not found`);
    }
    
    const templateData = templateResult[0] as any;

    // Créer le contrat
    const [contract] = await this.sequelize.query(`
      INSERT INTO contracts (
        id,
        agency_id,
        client_id,
        template_id,
        reference,
        status,
        start_date,
        end_date,
        periodicity,
        price,
        created_at,
        updated_at
      )
      VALUES (
        uuid_generate_v4(),
        :agencyId,
        :clientId,
        :templateId,
        :reference,
        'DRAFT',
        :startDate,
        :endDate,
        :periodicity,
        :price,
        NOW(),
        NOW()
      )
      RETURNING *;
    `, {
      replacements: {
        agencyId,
        clientId: createContractDto.clientId,
        templateId: createContractDto.templateId,
        reference,
        startDate: createContractDto.startDate,
        endDate: createContractDto.endDate || null,
        periodicity: templateData.periodicity,
        price: templateData.price,
      },
      type: 'SELECT',
    });

    return this.formatContract(contract);
  }

  async findAll(agencyId: string, filters: any = {}): Promise<any[]> {
    let query = `
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, ct.name as template_name
      FROM contracts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN contract_templates ct ON c.template_id = ct.id
      WHERE c.agency_id = :agencyId
    `;

    const replacements = { agencyId };

    // Ajouter des filtres si nécessaire
    if (filters.status) {
      query += ' AND c.status = :status';
      replacements['status'] = filters.status;
    }

    if (filters.clientId) {
      query += ' AND c.client_id = :clientId';
      replacements['clientId'] = filters.clientId;
    }

    if (filters.startDate) {
      query += ' AND c.start_date >= :startDate';
      replacements['startDate'] = filters.startDate;
    }

    if (filters.endDate) {
      query += ' AND (c.end_date IS NULL OR c.end_date <= :endDate)';
      replacements['endDate'] = filters.endDate;
    }

    query += ' ORDER BY c.created_at DESC';

    // Ajouter la pagination si nécessaire
    if (filters.limit) {
      query += ' LIMIT :limit';
      replacements['limit'] = filters.limit;

      if (filters.offset) {
        query += ' OFFSET :offset';
        replacements['offset'] = filters.offset;
      }
    }

    const contracts = await this.sequelize.query(query, {
      replacements,
      type: 'SELECT',
    });

    return contracts.map(contract => this.formatContract(contract));
  }

  async findOne(id: string, agencyId: string): Promise<any> {
    const [contract] = await this.sequelize.query(`
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, ct.name as template_name, ct.body_md
      FROM contracts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN contract_templates ct ON c.template_id = ct.id
      WHERE c.id = :id AND c.agency_id = :agencyId
    `, {
      replacements: { id, agencyId },
      type: 'SELECT',
    });

    if (!contract) {
      throw new NotFoundException(`Contract with id ${id} not found`);
    }

    return this.formatContract(contract);
  }

  async validate(id: string, agencyId: string): Promise<any> {
    const contract = await this.findOne(id, agencyId);

    if (contract.status !== 'DRAFT') {
      throw new ConflictException(`Contract with id ${id} is not in DRAFT status`);
    }

    const [updatedContract] = await this.sequelize.query(`
      UPDATE contracts
      SET status = 'VALIDATED', validated_at = NOW(), updated_at = NOW()
      WHERE id = :id AND agency_id = :agencyId
      RETURNING *;
    `, {
      replacements: { id, agencyId },
      type: 'SELECT',
    });

    // Émettre un événement CONTRACT_VALIDATED (à implémenter plus tard)

    return this.formatContract(updatedContract);
  }

  async sign(id: string, agencyId: string): Promise<any> {
    const contract = await this.findOne(id, agencyId);

    if (contract.status !== 'VALIDATED') {
      throw new ConflictException(`Contract with id ${id} is not in VALIDATED status`);
    }

    const [updatedContract] = await this.sequelize.query(`
      UPDATE contracts
      SET status = 'SIGNED', signed_at = NOW(), updated_at = NOW()
      WHERE id = :id AND agency_id = :agencyId
      RETURNING *;
    `, {
      replacements: { id, agencyId },
      type: 'SELECT',
    });

    return this.formatContract(updatedContract);
  }

  async terminate(id: string, agencyId: string, reason?: string): Promise<any> {
    const contract = await this.findOne(id, agencyId);

    if (contract.status !== 'SIGNED') {
      throw new ConflictException(`Contract with id ${id} is not in SIGNED status`);
    }

    const [updatedContract] = await this.sequelize.query(`
      UPDATE contracts
      SET status = 'TERMINATED', terminated_at = NOW(), updated_at = NOW()
      WHERE id = :id AND agency_id = :agencyId
      RETURNING *;
    `, {
      replacements: { id, agencyId },
      type: 'SELECT',
    });

    return this.formatContract(updatedContract);
  }

  async updateMeter(id: string, meterId: string): Promise<any> {
    const [contract] = await this.sequelize.query(`
      SELECT * FROM contracts WHERE id = :id
    `, {
      replacements: { id },
      type: 'SELECT',
    });

    if (!contract) {
      throw new NotFoundException(`Contract with id ${id} not found`);
    }

    const [updatedContract] = await this.sequelize.query(`
      UPDATE contracts
      SET meter_id = :meterId, updated_at = NOW()
      WHERE id = :id
      RETURNING *;
    `, {
      replacements: { id, meterId },
      type: 'SELECT',
    });

    return this.formatContract(updatedContract);
  }

  private formatContract(contract: any): any {
    return {
      id: contract.id,
      agencyId: contract.agency_id,
      clientId: contract.client_id,
      templateId: contract.template_id,
      meterId: contract.meter_id,
      reference: contract.reference,
      status: contract.status,
      startDate: contract.start_date,
      endDate: contract.end_date,
      periodicity: contract.periodicity,
      price: parseFloat(contract.price),
      createdAt: contract.created_at,
      validatedAt: contract.validated_at,
      signedAt: contract.signed_at,
      terminatedAt: contract.terminated_at,
      updatedAt: contract.updated_at,
      // Informations supplémentaires
      clientName: contract.client_nom && contract.client_prenom ? 
        `${contract.client_prenom} ${contract.client_nom}` : undefined,
      templateName: contract.template_name,
      templateContent: contract.body_md,
    };
  }
}
