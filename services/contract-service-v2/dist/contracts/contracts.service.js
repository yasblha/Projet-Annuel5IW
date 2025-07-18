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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_typescript_1 = require("sequelize-typescript");
let ContractsService = class ContractsService {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }
    async create(agencyId, createContractDto) {
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
            throw new common_1.NotFoundException(`Client with id ${createContractDto.clientId} not found`);
        }
        const year = new Date().getFullYear();
        const countResult = await this.sequelize.query(`
      SELECT COUNT(*) as count FROM contracts WHERE reference LIKE :yearPrefix
    `, {
            replacements: { yearPrefix: `CTR-${year}-%` },
            type: 'SELECT',
        });
        const count = countResult[0]['count'];
        const paddedNumber = (count + 1).toString().padStart(4, '0');
        const reference = `CTR-${year}-${paddedNumber}`;
        const templateResult = await this.sequelize.query(`
      SELECT * FROM contract_templates WHERE id = :templateId
    `, {
            replacements: { templateId: createContractDto.templateId },
            type: 'SELECT',
        });
        if (!templateResult || !templateResult[0]) {
            throw new common_1.NotFoundException(`Template with id ${createContractDto.templateId} not found`);
        }
        const templateData = templateResult[0];
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
    async findAll(agencyId, filters = {}) {
        let query = `
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, ct.name as template_name
      FROM contracts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN contract_templates ct ON c.template_id = ct.id
      WHERE c.agency_id = :agencyId
    `;
        const replacements = { agencyId };
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
    async findOne(id, agencyId) {
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
            throw new common_1.NotFoundException(`Contract with id ${id} not found`);
        }
        return this.formatContract(contract);
    }
    async validate(id, agencyId) {
        const contract = await this.findOne(id, agencyId);
        if (contract.status !== 'DRAFT') {
            throw new common_1.ConflictException(`Contract with id ${id} is not in DRAFT status`);
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
        return this.formatContract(updatedContract);
    }
    async sign(id, agencyId) {
        const contract = await this.findOne(id, agencyId);
        if (contract.status !== 'VALIDATED') {
            throw new common_1.ConflictException(`Contract with id ${id} is not in VALIDATED status`);
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
    async terminate(id, agencyId, reason) {
        const contract = await this.findOne(id, agencyId);
        if (contract.status !== 'SIGNED') {
            throw new common_1.ConflictException(`Contract with id ${id} is not in SIGNED status`);
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
    async updateMeter(id, meterId) {
        const [contract] = await this.sequelize.query(`
      SELECT * FROM contracts WHERE id = :id
    `, {
            replacements: { id },
            type: 'SELECT',
        });
        if (!contract) {
            throw new common_1.NotFoundException(`Contract with id ${id} not found`);
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
    formatContract(contract) {
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
            clientName: contract.client_nom && contract.client_prenom ?
                `${contract.client_prenom} ${contract.client_nom}` : undefined,
            templateName: contract.template_name,
            templateContent: contract.body_md,
        };
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sequelize_typescript_1.Sequelize])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map