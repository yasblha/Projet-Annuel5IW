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
        zone: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Tarif',
        tableName: 'tarifs',
        timestamps: false,
    });

    return Tarif;
};