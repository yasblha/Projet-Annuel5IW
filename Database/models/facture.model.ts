import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class Facture extends Model {
        static associate(models: any) {
            Facture.belongsTo(models.Utilisateur, { foreignKey: 'clientId', as: 'client' });
            Facture.hasMany(models.LigneFacture, { foreignKey: 'factureId', as: 'lignes' });
            Facture.hasMany(models.Paiement, { foreignKey: 'factureId', as: 'paiements' });
            Facture.belongsToMany(models.LotFacturation, { through: 'lot_facturation_factures', foreignKey: 'factureId', otherKey: 'lotId', as: 'lots' });
        }
    }

    Facture.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        numero: { type: DataTypes.STRING, allowNull: false, unique: true },
        dateEmission: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateEcheance: { type: DataTypes.DATE, allowNull: false },
        montantHT: { type: DataTypes.DECIMAL, allowNull: false },
        tauxTVA: { type: DataTypes.DECIMAL, allowNull: false },
        remise: { type: DataTypes.DECIMAL, allowNull: true, defaultValue: 0 },
        mentionsLegales: { type: DataTypes.TEXT, allowNull: false },
        conditionsPaiement: { type: DataTypes.TEXT, allowNull: true },
        clientId: { type: DataTypes.UUID, allowNull: false },
        statut: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'BROUILLON' },
        datePaiement: { type: DataTypes.DATE, allowNull: true },
        modePaiement: { type: DataTypes.STRING(30), allowNull: true },
        commentaire: { type: DataTypes.TEXT, allowNull: true },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Facture',
        tableName: 'factures',
        timestamps: false,
    });

    return Facture;
};