import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class Lettrage extends Model {
        static associate(models: any) {
            Lettrage.belongsTo(models.Facture, { foreignKey: 'factureId', as: 'facture' });
            Lettrage.belongsTo(models.Paiement, { foreignKey: 'paiementId', as: 'paiement' });
        }
    }

    Lettrage.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        factureId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        paiementId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        montantLettre: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        dateLettrage: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Lettrage',
        tableName: 'lettrages',
        timestamps: false
    });

    return Lettrage;
};