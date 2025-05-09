import { DataTypes, Model, Sequelize } from 'sequelize';
export default (sequelize: Sequelize): typeof Model => {
    class Entreprise extends Model {
        static associate(models: any) {
            Entreprise.hasMany(models.Contrat, { foreignKey: 'proprietaireId', as: 'contrats' });
        }
    }
    Entreprise.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        nom: { type: DataTypes.STRING, allowNull: false },
        siret: { type: DataTypes.STRING, allowNull: true, unique: true },
        adresse: { type: DataTypes.TEXT, allowNull: true },
        contactEmail: { type: DataTypes.STRING, allowNull: true },
        contactTelephone: { type: DataTypes.STRING, allowNull: true },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    },{
        sequelize,
        modelName: 'Entreprise',
        tableName: 'entreprises',
        timestamps: false
    });
    return Entreprise;
};
