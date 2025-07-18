import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ListClientsDto } from './dto/list-clients.dto';
import { Client } from './interfaces/client.interface';

@Injectable()
export class ClientsService {
  constructor(
    @Inject('SEQUELIZE') private sequelize: Sequelize,
  ) {}

  async create(agencyId: string, createClientDto: CreateClientDto): Promise<Client> {
    // Vérifier si un client avec cet email existe déjà
    const existingClient = await this.findByEmail(createClientDto.email, agencyId);
    if (existingClient) {
      throw new ConflictException('Un client avec cet email existe déjà');
    }

    // Créer le client
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

  async findAll(
    agencyId: string | null, 
    page: number = 1, 
    limit: number = 10, 
    search: string = '', 
    type: string = '', 
    statut: string = ''
  ): Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    const replacements: any = { limit, offset };
    
    // Ajouter la condition d'agence seulement si agencyId est fourni
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
    
    // Récupération des clients
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
    
    // Récupération du nombre total de clients
    const countResult = await this.sequelize.query(`
      SELECT COUNT(*)::integer as count
      FROM clients
      ${whereClause};
    `, {
      replacements,
      type: 'SELECT',
    });
    
    // Extraction des résultats
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

  async findById(id: string, agencyId: string): Promise<Client> {
    const [client] = await this.sequelize.query(`
      SELECT *
      FROM clients
      WHERE id = :id AND agency_id = :agencyId;
    `, {
      replacements: { id, agencyId },
      type: 'SELECT',
    });
    
    if (!client) {
      throw new NotFoundException('Client non trouvé');
    }
    
    return this.formatClient(client);
  }

  async findByEmail(email: string, agencyId: string): Promise<Client | null> {
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

  async update(id: string, agencyId: string, updateClientDto: UpdateClientDto): Promise<Client> {
    // Vérifier si le client existe
    await this.findById(id, agencyId);
    
    // Vérifier si l'email est déjà utilisé par un autre client
    if (updateClientDto.email) {
      const existingClient = await this.findByEmail(updateClientDto.email, agencyId);
      if (existingClient && existingClient.id !== id) {
        throw new ConflictException('Un client avec cet email existe déjà');
      }
    }
    
    // Construire dynamiquement la requête SQL de mise à jour
    const updateFields = [];
    const replacements: any = { id, agencyId };
    
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
    
    // Ajouter le champ updated_at
    updateFields.push('updated_at = NOW()');
    
    if (updateFields.length === 0) {
      throw new BadRequestException('Aucune donnée à mettre à jour');
    }
    
    // Exécuter la requête de mise à jour
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
      throw new NotFoundException('Client non trouvé');
    }
    
    return this.formatClient(updatedClient);
  }

  async delete(id: string, agencyId: string): Promise<void> {
    // Vérifier si le client existe
    await this.findById(id, agencyId);
    
    // Suppression logique (soft delete)
    const result = await this.sequelize.query(`
      UPDATE clients
      SET deleted_at = NOW()
      WHERE id = :id AND agency_id = :agencyId;
    `, {
      replacements: { id, agencyId },
    });
    
    const affectedRows = result && Array.isArray(result) && result[1] ? result[1] : 0;
    
    if (affectedRows === 0) {
      throw new NotFoundException('Client non trouvé');
    }
  }

  // Méthode utilitaire pour formater un client
  private formatClient(client: any): Client {
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
}
