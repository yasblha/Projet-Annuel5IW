import { DataTypes, Model, Sequelize } from 'sequelize';
export default (sequelize: Sequelize): typeof Model => {
    class Entreprise extends Model {
        static associate(models: any) {
            Entreprise.hasMany(models.Contrat, { foreignKey: 'proprietaireId', as: 'contrats' });
            Entreprise.hasMany(models.Client, { foreignKey: 'proprietaireEntrepriseId', as: 'clients' });
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
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        adresseSiege: { type: DataTypes.TEXT, allowNull: true },
        siteWeb: { type: DataTypes.STRING, allowNull: true },
        typeEntreprise: { type: DataTypes.STRING(30), allowNull: true },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    },{
        sequelize,
        modelName: 'Entreprise',
        tableName: 'entreprises',
        timestamps: false
    });
    return Entreprise;
};
