import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class Tarif extends Model {
        static associate(models: any) {
            Tarif.hasMany(models.Contrat, { foreignKey: 'tarifId', as: 'contrats' });
        }
    }

    Tarif.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        nom: { type: DataTypes.STRING, allowNull: false },
        prixUnitaireM3: { type: DataTypes.DECIMAL, allowNull: false },
        fraisFixes: { type: DataTypes.DECIMAL, allowNull: true },
        zone: { type: DataTypes.STRING, allowNull: true },
        dateDebutValidite: { type: DataTypes.DATE, allowNull: true },
        dateFinValidite: { type: DataTypes.DATE, allowNull: true },
        statut: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'ACTIF' },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Tarif',
        tableName: 'tarifs',
        timestamps: false,
    });

    return Tarif;
};