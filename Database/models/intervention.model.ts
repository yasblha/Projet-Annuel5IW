import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class Intervention extends Model {
        static associate(models: any) {
            Intervention.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'demandeur' });
            Intervention.belongsTo(models.Compteur, { foreignKey: 'compteurId', as: 'compteur' });
            Intervention.belongsTo(models.Utilisateur, { foreignKey: 'technicienId', as: 'technicien' });
        }
    }

    Intervention.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        utilisateurId: { type: DataTypes.UUID, allowNull: false },
        compteurId: { type: DataTypes.UUID, allowNull: false },
        type: { type: DataTypes.ENUM('INSTALLATION','REPARATION','RELEVE'), allowNull: false },
        datePlanifiee: { type: DataTypes.DATE, allowNull: false },
        dateRealisee: { type: DataTypes.DATE, allowNull: true },
        technicienId: { type: DataTypes.UUID, allowNull: true },
        statut: { type: DataTypes.ENUM('PROGRAMMEE','EN_COURS','TERMINEE'), allowNull: false, defaultValue: 'PROGRAMMEE' },
        priorite: { type: DataTypes.ENUM('HAUTE','MOYENNE','BASSE'), allowNull: false, defaultValue: 'MOYENNE' },
        description: { type: DataTypes.TEXT, allowNull: true },
        resultat: { type: DataTypes.TEXT, allowNull: true },
        cout: { type: DataTypes.DECIMAL, allowNull: true },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Intervention',
        tableName: 'interventions',
        timestamps: false,
    });

    return Intervention;
};