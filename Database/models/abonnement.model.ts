import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class Abonnement extends Model {
        static associate(models: any) {
            Abonnement.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'client' });
            Abonnement.belongsTo(models.Compteur, { foreignKey: 'compteurId', as: 'compteur' });
        }
    }

    Abonnement.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        utilisateurId: { type: DataTypes.UUID, allowNull: false },
        compteurId: { type: DataTypes.UUID, allowNull: false },
        dateDebut: { type: DataTypes.DATE, allowNull: false },
        dateFin: { type: DataTypes.DATE, allowNull: true },
        frequence: { type: DataTypes.ENUM('MENSUELLE','TRIMESTRIELLE','ANNUELLE'), defaultValue: 'MENSUELLE' }
    }, {
        sequelize,
        modelName: 'Abonnement',
        tableName: 'abonnements',
        timestamps: false,
    });

    return Abonnement;
};