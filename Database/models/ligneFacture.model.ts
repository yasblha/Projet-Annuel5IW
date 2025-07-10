import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class LigneFacture extends Model {
        static associate(models: any) {
            LigneFacture.belongsTo(models.Facture, { foreignKey: 'factureId', as: 'facture' });
        }
    }

    LigneFacture.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        factureId: { type: DataTypes.UUID, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        quantite: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        unite: { type: DataTypes.STRING, allowNull: false, defaultValue: 'unité' },
        prixUnitaire: { type: DataTypes.DECIMAL, allowNull: false },
        tauxTVA: { type: DataTypes.DECIMAL, allowNull: false },
        statut: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'NORMAL' },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'LigneFacture',
        tableName: 'ligne_factures',
        timestamps: false,
    });

    return LigneFacture;
};