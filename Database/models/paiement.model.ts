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
        }
    }, {
        sequelize,
        modelName: 'Paiement',
        tableName: 'paiements',
        timestamps: false
    });

    return Paiement;
};