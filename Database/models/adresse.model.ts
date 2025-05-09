import { DataTypes, Model, Sequelize } from 'sequelize';

export default function initAdresse(sequelize: Sequelize): typeof Model {
    class Adresse extends Model {
        static associate(models: any) {
            Adresse.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });
        }
    }

    Adresse.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        utilisateurId: { type: DataTypes.UUID, allowNull: false },
        type: { type: DataTypes.ENUM('FACTURATION','LIVRAISON'), allowNull: false },
        ligne1: { type: DataTypes.STRING, allowNull: false },
        ligne2: { type: DataTypes.STRING, allowNull: true },
        codePostal: { type: DataTypes.STRING, allowNull: false },
        ville: { type: DataTypes.STRING, allowNull: false },
        pays: { type: DataTypes.STRING, allowNull: false, defaultValue: 'FR' }
    }, {
        sequelize,
        modelName: 'Adresse',
        tableName: 'adresses',
        timestamps: false,
    });

    return Adresse;
}