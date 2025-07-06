import { models } from '@Database/sequelize';

const { ContractCosigner } = models;

/**
 * Repository Sequelize pur pour la gestion des cosignataires
 */
export class ContractCosignerRepository {
    private readonly repo = ContractCosigner;

    /** Crée un cosignataire */
    async create(data: {
        contratId: string;
        cosignataireId: string;
        typeCosignataire: 'UTILISATEUR' | 'ENTREPRISE';
        roleType?: 'PRINCIPAL' | 'SECONDARY';
        pourcentageParts?: number | null;
        statutInvitation?: 'ENVOYE' | 'ACCEPTE' | 'REFUSE';
        signatureElectronique?: boolean;
        signatureDate?: Date | null;
    }) {
        return this.repo.create(data);
    }

    /** Liste tous les cosignataires */
    async findAll() {
        return this.repo.findAll();
    }

    /** Trouve un cosignataire par ID */
    async findById(id: string) {
        const cosigner = await this.repo.findByPk(id);
        if (!cosigner) throw new Error(`Cosignataire non trouvé (id=${id})`);
        return cosigner;
    }

    /** Liste les cosignataires d’un contrat */
    async findByContract(contratId: string) {
        return this.repo.findAll({ where: { contratId } });
    }

    /** Met à jour le statut d’invitation */
    async updateInvitationStatus(id: string, statutInvitation: 'ENVOYE' | 'ACCEPTE' | 'REFUSE', dateReponse: Date = new Date()) {
        const [updatedCount] = await this.repo.update(
            { statutInvitation, dateReponse },
            { where: { id } }
        );
        if (updatedCount === 0) throw new Error(`Cosignataire non trouvé (id=${id})`);
    }

    /** Met à jour un cosignataire */
    async update(id: string, updates: Partial<{
        roleType: 'PRINCIPAL' | 'SECONDARY';
        pourcentageParts: number | null;
        statutInvitation: 'ENVOYE' | 'ACCEPTE' | 'REFUSE';
        signatureElectronique: boolean;
        signatureDate: Date | null;
    }>) {
        const [updatedCount] = await this.repo.update(updates, { where: { id } });
        if (updatedCount === 0) throw new Error(`Échec de la mise à jour (id=${id})`);
    }

    /** Supprime un cosignataire (hard delete) */
    async remove(id: string): Promise<void> {
        const cosigner = await this.findById(id);
        await cosigner.destroy();
    }
}
