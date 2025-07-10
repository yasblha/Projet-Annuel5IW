import { DataTypes, Model, Sequelize } from 'sequelize';
export default (sequelize: Sequelize): typeof Model => {
    class Contrat extends Model {
        static associate(models: any) {
            // Propriétaire polymorphe: utilisateur ou entreprise
            Contrat.belongsTo(models.Utilisateur, { foreignKey: 'proprietaireId', constraints: false, as: 'proprietaireUser' });
            Contrat.belongsTo(models.Entreprise, { foreignKey: 'proprietaireId', constraints: false, as: 'proprietaireEnt' });
            Contrat.hasMany(models.ContractCosigner, { foreignKey: 'contratId', as: 'cosignataires' });
        }
    }
    Contrat.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        proprietaireId: { type: DataTypes.UUID, allowNull: false },
        typeProprietaire: { type: DataTypes.ENUM('UTILISATEUR','ENTREPRISE'), allowNull: false },
        numero: { type: DataTypes.STRING, allowNull: false, unique: true },
        dateDebut: { type: DataTypes.DATE, allowNull: false },
        dateFin: { type: DataTypes.DATE, allowNull: true },
        statut: { type: DataTypes.ENUM('EN_ATTENTE','ACTIF','SUSPENDU','ANNULE','TERMINE'), allowNull: false, defaultValue: 'EN_ATTENTE' },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        objet: { type: DataTypes.TEXT, allowNull: true },
        montantTotal: { type: DataTypes.DECIMAL, allowNull: true },
        dateSignature: { type: DataTypes.DATE, allowNull: true },
        dateResiliation: { type: DataTypes.DATE, allowNull: true },
        motifResiliation: { type: DataTypes.TEXT, allowNull: true },
        statutSignature: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'EN_ATTENTE' },
        zone: { type: DataTypes.STRING(10), allowNull: false },
        typeContrat: { type: DataTypes.ENUM('I','P','C','A'), allowNull: false },
        tenantId: { type: DataTypes.STRING, allowNull: true },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true }
    },{
        sequelize,
        modelName: 'Contrat',
        tableName: 'contrats',
        timestamps: false
    });
    return Contrat;
};