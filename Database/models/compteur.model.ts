import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class Compteur extends Model {
        static associate(models: any) {
            Compteur.hasMany(models.Intervention, { foreignKey: 'compteurId', as: 'interventions' });
            Compteur.hasMany(models.Abonnement, { foreignKey: 'compteurId', as: 'abonnements' });
        }
    }

    Compteur.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        serial: { type: DataTypes.STRING, allowNull: false, unique: true },
        type: { type: DataTypes.ENUM('EAU_POTABLE','ASSAINISSEMENT'), allowNull: false },
        statut: { type: DataTypes.ENUM('ACTIF','INACTIF','DEFAILLANT'), allowNull: false, defaultValue: 'ACTIF' },
        emplacement: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Compteur',
        tableName: 'compteurs',
        timestamps:false
});

    return Compteur;
};