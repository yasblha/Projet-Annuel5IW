import { models } from '@Database/sequelize';

const { Contrat } = models;

/**
 * Repository Sequelize pur pour la gestion des contrats
 */
export class ContractRepository {
    private readonly repo = Contrat;

    /** Crée un contrat */
    async create(data: {
        proprietaireId: string;
        typeProprietaire: 'UTILISATEUR' | 'ENTREPRISE';
        numero: string;
        dateDebut: Date;
        dateFin?: Date | null;
        statut?: 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU' | 'ANNULE' | 'TERMINE';
    }) {
        return this.repo.create(data);
    }

    /** Trouve tous les contrats */
    async findAll() {
        return this.repo.findAll();
    }

    /** Trouve un contrat par ID */
    async findById(id: string) {
        const contract = await this.repo.findByPk(id);
        if (!contract) throw new Error(`Contrat non trouvé (id=${id})`);
        return contract;
    }

    /** Trouve un contrat par son numéro */
    async findByNumero(numero: string) {
        return this.repo.findOne({ where: { numero } });
    }

    /** Trouve les contrats d’un propriétaire */
    async findByProprietaire(proprietaireId: string) {
        return this.repo.findAll({ where: { proprietaireId } });
    }

    /** Met à jour un contrat */
    async update(id: string, updates: Partial<{
        numero: string;
        dateDebut: Date;
        dateFin: Date | null;
        statut: 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU' | 'ANNULE' | 'TERMINE';
    }>) {
        const [updatedCount] = await this.repo.update(updates, { where: { id } });
        if (updatedCount === 0) throw new Error(`Échec de la mise à jour (id=${id})`);
    }

    /** Supprime un contrat (hard delete) */
    async remove(id: string): Promise<void> {
        const contract = await this.findById(id);
        await contract.destroy();
    }

    /** Recherche par statut */
    async findByStatut(statut: 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU' | 'ANNULE' | 'TERMINE') {
        return this.repo.findAll({ where: { statut } });
    }
}
