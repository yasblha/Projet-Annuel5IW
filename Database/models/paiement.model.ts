import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class Paiement extends Model {
        static associate(models: any) {
            Paiement.belongsTo(models.Facture, { foreignKey: 'factureId', as: 'facture' });
            Paiement.hasMany(models.Lettrage, { foreignKey: 'paiementId', as: 'lettrages' });
        }
    }

    Paiement.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        factureId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        montant: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        methode: {
            type: DataTypes.ENUM('CARTE','SEPA','MOBILE','VIREMENT'),
            allowNull: false
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fraisTransaction: {
            type: DataTypes.DECIMAL,
            allowNull: true
        },
        datePaiement: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        statut: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'EN_ATTENTE' },
        dateValidation: { type: DataTypes.DATE, allowNull: true },
        commentaire: { type: DataTypes.TEXT, allowNull: true },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Paiement',
        tableName: 'paiements',
        timestamps: false
    });

    return Paiement;
};