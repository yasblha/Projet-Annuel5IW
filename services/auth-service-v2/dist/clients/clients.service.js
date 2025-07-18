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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("sequelize");
let ClientsService = class ClientsService {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }
    async create(agencyId, createClientDto) {
        const existingClient = await this.findByEmail(createClientDto.email, agencyId);
        if (existingClient) {
            throw new common_1.ConflictException('Un client avec cet email existe déjà');
        }
        const [client] = await this.sequelize.query(`
      INSERT INTO clients (
        id,
        agency_id, 
        type, 
        statut, 
        nom, 
        prenom, 
        email, 
        telephone, 
        adresse_ligne1, 
        adresse_ligne2, 
        code_postal, 
        ville,
        "dateCreation",
        "dateMaj"
      )
      VALUES (
        uuid_generate_v4(),
        :agencyId, 
        :type, 
        :statut, 
        :nom, 
        :prenom, 
        :email, 
        :telephone, 
        :adresseLigne1, 
        :adresseLigne2, 
        :codePostal, 
        :ville,
        NOW(),
        NOW()
      )
      RETURNING *;
    `, {
            replacements: {
                agencyId,
                type: createClientDto.type || 'PARTICULIER',
                statut: createClientDto.statut || 'PROSPECT',
                nom: createClientDto.nom,
                prenom: createClientDto.prenom,
                email: createClientDto.email,
                telephone: createClientDto.telephone || null,
                adresseLigne1: createClientDto.adresse?.ligne1 || createClientDto.adresseLigne1 || null,
                adresseLigne2: createClientDto.adresse?.ligne2 || createClientDto.adresseLigne2 || null,
                codePostal: createClientDto.adresse?.codePostal || createClientDto.codePostal || null,
                ville: createClientDto.adresse?.ville || createClientDto.ville || null,
            },
            type: 'SELECT',
        });
        return this.formatClient(client);
    }
    async findAll(agencyId, page = 1, limit = 10, search = '', type = '', statut = '') {
        const offset = (page - 1) * limit;
        let whereConditions = [];
        const replacements = { limit, offset };
        if (agencyId) {
            whereConditions.push("agency_id = :agencyId");
            replacements.agencyId = agencyId;
        }
        if (type) {
            whereConditions.push("type = :type");
            replacements.type = type;
        }
        if (statut) {
            whereConditions.push("statut = :statut");
            replacements.statut = statut;
        }
        if (search) {
            whereConditions.push("(email ILIKE :search OR nom ILIKE :search OR prenom ILIKE :search OR telephone ILIKE :search)");
            replacements.search = `%${search}%`;
        }
        const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";
        const clientsResult = await this.sequelize.query(`
      SELECT *
      FROM clients
      ${whereClause}
      LIMIT :limit
      OFFSET :offset;
    `, {
            replacements,
            type: 'SELECT',
        });
        const countResult = await this.sequelize.query(`
      SELECT COUNT(*)::integer as count
      FROM clients
      ${whereClause};
    `, {
            replacements,
            type: 'SELECT',
        });
        const clientsList = Array.isArray(clientsResult) ? clientsResult.map(client => this.formatClient(client)) : [];
        const totalCount = countResult && countResult[0] &&
            typeof countResult[0] === 'object' && 'count' in countResult[0] ?
            Number(countResult[0].count) : 0;
        return {
            items: clientsList,
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        };
    }
    async findById(id, agencyId) {
        const [client] = await this.sequelize.query(`
      SELECT *
      FROM clients
      WHERE id = :id AND agency_id = :agencyId;
    `, {
            replacements: { id, agencyId },
            type: 'SELECT',
        });
        if (!client) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        return this.formatClient(client);
    }
    async findByEmail(email, agencyId) {
        const [client] = await this.sequelize.query(`
      SELECT *
      FROM clients
      WHERE email = :email AND agency_id = :agencyId;
    `, {
            replacements: { email, agencyId },
            type: 'SELECT',
        });
        return client ? this.formatClient(client) : null;
    }
    async update(id, agencyId, updateClientDto) {
        await this.findById(id, agencyId);
        if (updateClientDto.email) {
            const existingClient = await this.findByEmail(updateClientDto.email, agencyId);
            if (existingClient && existingClient.id !== id) {
                throw new common_1.ConflictException('Un client avec cet email existe déjà');
            }
        }
        const updateFields = [];
        const replacements = { id, agencyId };
        if (updateClientDto.nom !== undefined) {
            updateFields.push('nom = :nom');
            replacements.nom = updateClientDto.nom;
        }
        if (updateClientDto.prenom !== undefined) {
            updateFields.push('prenom = :prenom');
            replacements.prenom = updateClientDto.prenom;
        }
        if (updateClientDto.email !== undefined) {
            updateFields.push('email = :email');
            replacements.email = updateClientDto.email;
        }
        if (updateClientDto.telephone !== undefined) {
            updateFields.push('telephone = :telephone');
            replacements.telephone = updateClientDto.telephone;
        }
        if (updateClientDto.type !== undefined) {
            updateFields.push('type = :type');
            replacements.type = updateClientDto.type;
        }
        if (updateClientDto.statut !== undefined) {
            updateFields.push('statut = :statut');
            replacements.statut = updateClientDto.statut;
        }
        if (updateClientDto.adresse) {
            if (updateClientDto.adresse.ligne1 !== undefined) {
                updateFields.push('adresse_ligne1 = :adresseLigne1');
                replacements.adresseLigne1 = updateClientDto.adresse.ligne1;
            }
            if (updateClientDto.adresse.ligne2 !== undefined) {
                updateFields.push('adresse_ligne2 = :adresseLigne2');
                replacements.adresseLigne2 = updateClientDto.adresse.ligne2;
            }
            if (updateClientDto.adresse.codePostal !== undefined) {
                updateFields.push('code_postal = :codePostal');
                replacements.codePostal = updateClientDto.adresse.codePostal;
            }
            if (updateClientDto.adresse.ville !== undefined) {
                updateFields.push('ville = :ville');
                replacements.ville = updateClientDto.adresse.ville;
            }
        }
        updateFields.push('updated_at = NOW()');
        if (updateFields.length === 0) {
            throw new common_1.BadRequestException('Aucune donnée à mettre à jour');
        }
        const [updatedClient] = await this.sequelize.query(`
      UPDATE clients
      SET ${updateFields.join(', ')}
      WHERE id = :id AND agency_id = :agencyId
      RETURNING *;
    `, {
            replacements,
            type: 'SELECT',
        });
        if (!updatedClient) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        return this.formatClient(updatedClient);
    }
    async delete(id, agencyId) {
        await this.findById(id, agencyId);
        const result = await this.sequelize.query(`
      UPDATE clients
      SET deleted_at = NOW()
      WHERE id = :id AND agency_id = :agencyId;
    `, {
            replacements: { id, agencyId },
        });
        const affectedRows = result && Array.isArray(result) && result[1] ? result[1] : 0;
        if (affectedRows === 0) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
    }
    formatClient(client) {
        return {
            id: client.id,
            agencyId: client.agency_id,
            type: client.type,
            statut: client.statut,
            nom: client.nom,
            prenom: client.prenom,
            email: client.email,
            telephone: client.telephone,
            adresse: {
                ligne1: client.adresse_ligne1,
                ligne2: client.adresse_ligne2,
                codePostal: client.code_postal,
                ville: client.ville,
            },
            impaye: client.impaye,
            facturesImpayees: client.factures_impayees,
            dernierPaiement: client.dernier_paiement,
            createdAt: client.created_at,
            updatedAt: client.updated_at,
            dateCreation: client.dateCreation,
            dateMaj: client.dateMaj,
        };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SEQUELIZE')),
    __metadata("design:paramtypes", [sequelize_1.Sequelize])
], ClientsService);
//# sourceMappingURL=clients.service.js.map