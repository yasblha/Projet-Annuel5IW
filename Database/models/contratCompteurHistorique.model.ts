import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class ContratCompteurHistorique extends Model {
        static associate(models: any) {
            ContratCompteurHistorique.belongsTo(models.Contrat, { foreignKey: 'contratId', as: 'contrat' });
            ContratCompteurHistorique.belongsTo(models.Compteur, { foreignKey: 'compteurId', as: 'compteur' });
            ContratCompteurHistorique.belongsTo(models.Intervention, { foreignKey: 'interventionId', as: 'intervention' });
        }
    }

    ContratCompteurHistorique.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        contratId: { type: DataTypes.UUID, allowNull: false },
        compteurId: { type: DataTypes.UUID, allowNull: false },
        interventionId: { type: DataTypes.UUID, allowNull: true }, // Intervention qui a causé l'association/dissociation
        typeAction: { 
            type: DataTypes.ENUM('ASSOCIATION', 'DISSOCIATION', 'REMPLACEMENT'), 
            allowNull: false 
        },
        dateDebut: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateFin: { type: DataTypes.DATE, allowNull: true }, // null si toujours actif
        motif: { type: DataTypes.TEXT, allowNull: true }, // Motif de l'action
        commentaire: { type: DataTypes.TEXT, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: 'ContratCompteurHistorique',
        tableName: 'contrat_compteur_historiques',
        timestamps: false
    });

    return ContratCompteurHistorique;
}; 