import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class Client extends Model {
        static associate(models: any) {
            // Associations spécifiques aux clients
            Client.hasMany(models.Contrat, { foreignKey: 'clientId', as: 'contrats' });
            Client.hasMany(models.Facture, { foreignKey: 'clientId', as: 'factures' });
            Client.hasMany(models.Abonnement, { foreignKey: 'clientId', as: 'abonnements' });
            Client.hasMany(models.Adresse, { foreignKey: 'clientId', as: 'adresses' });
            
            // Association avec Entreprise
            Client.belongsTo(models.Entreprise, { foreignKey: 'proprietaireEntrepriseId', as: 'entreprise' });
        }
    }

    Client.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prenom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        telephone: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        // Coordonnées bancaires
        rib: {
            type: DataTypes.STRING, // IBAN complet ou RIB formaté
            allowNull: true,
        },
        modePaiement: {
            type: DataTypes.ENUM('PRELEVEMENT', 'VIREMENT', 'CHEQUE', 'CARTE', 'ESPECES', 'AUTRE'),
            allowNull: true,
            defaultValue: 'PRELEVEMENT',
        },
        type: {
            type: DataTypes.ENUM('PARTICULIER', 'ENTREPRISE'),
            allowNull: false,
            defaultValue: 'PARTICULIER'
        },
        // Statut principal du client
        statut: {
            type: DataTypes.ENUM('PROSPECT', 'ACTIF', 'SUSPENDU', 'INACTIF', 'RESILIE', 'ARCHIVE'),
            allowNull: false,
            defaultValue: 'PROSPECT'
        },
        // Statuts métier détaillés
        statutContractuel: {
            type: DataTypes.ENUM('SANS_CONTRAT', 'EN_NEGOCIATION', 'EN_ATTENTE_SIGNATURE', 'CONTRAT_ACTIF', 'CONTRAT_SUSPENDU', 'CONTRAT_RESILIE', 'CONTRAT_EXPIRE'),
            allowNull: false,
            defaultValue: 'SANS_CONTRAT'
        },
        statutPaiement: {
            type: DataTypes.ENUM('A_JOUR', 'RETARD_LEGER', 'RETARD_MODERE', 'RETARD_IMPORTANT', 'IMPAYE', 'EN_PROCEDURE', 'LITIGE'),
            allowNull: false,
            defaultValue: 'A_JOUR'
        },
        statutTechnique: {
            type: DataTypes.ENUM('OPERATIONNEL', 'MAINTENANCE', 'DEFAILLANT', 'COUPURE', 'INSTALLATION', 'DEMENAGEMENT'),
            allowNull: false,
            defaultValue: 'OPERATIONNEL'
        },
        statutAbonnement: {
            type: DataTypes.ENUM('SANS_ABONNEMENT', 'ABONNEMENT_ACTIF', 'ABONNEMENT_SUSPENDU', 'ABONNEMENT_EXPIRE', 'EN_CREATION'),
            allowNull: false,
            defaultValue: 'SANS_ABONNEMENT'
        },
        statutFacturation: {
            type: DataTypes.ENUM('FACTURATION_NORMALE', 'FACTURATION_SUSPENDUE', 'FACTURATION_ESTIMEE', 'FACTURATION_ANNULEE'),
            allowNull: false,
            defaultValue: 'FACTURATION_NORMALE'
        },
        // Informations métier
        montantImpaye: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        dateDernierPaiement: {
            type: DataTypes.DATE,
            allowNull: true
        },
        dateDerniereFacture: {
            type: DataTypes.DATE,
            allowNull: true
        },
        nombreFacturesImpayees: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        tenantId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        proprietaireEntrepriseId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'entreprises', key: 'id' }
        },
        dateCreation: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        dateMaj: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Client',
        tableName: 'clients',
        timestamps: true,
        createdAt: 'dateCreation',
        updatedAt: 'dateMaj'
    });

    return Client;
}; 