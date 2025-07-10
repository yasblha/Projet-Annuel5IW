import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class LotFacturation extends Model {
        static associate(models: any) {
            LotFacturation.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'createur' });
            LotFacturation.belongsToMany(models.Facture, { through: 'lot_facturation_factures', foreignKey: 'lotId', otherKey: 'factureId', as: 'factures' });
        }
    }

    LotFacturation.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        codeLot: { type: DataTypes.STRING, allowNull: false, unique: true },
        dateGeneration: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateEnvoi: { type: DataTypes.DATE, allowNull: true },
        statut: { type: DataTypes.ENUM('EN_PREPARATION','VALIDE','ENVOYE','ARCHIVE'), allowNull: false, defaultValue: 'EN_PREPARATION' },
        utilisateurId: { type: DataTypes.UUID, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        dateCloture: { type: DataTypes.DATE, allowNull: true },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'LotFacturation',
        tableName: 'lots_facturation',
        timestamps: false,
    });

    return LotFacturation;
};