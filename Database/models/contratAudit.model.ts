import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class ContratAudit extends Model {
        static associate(models: any) {
            ContratAudit.belongsTo(models.Contrat, { foreignKey: 'contratId', as: 'contrat' });
            ContratAudit.belongsTo(models.Utilisateur, { foreignKey: 'userId', as: 'user' });
        }
    }

    ContratAudit.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        contratId: { type: DataTypes.UUID, allowNull: false },
        userId: { type: DataTypes.UUID, allowNull: true }, // Utilisateur qui a effectué l'action
        action: { 
            type: DataTypes.ENUM(
                'CREATION', 'MODIFICATION', 'SIGNATURE', 'RESILIATION', 'SUSPENSION', 
                'RENOUVELLEMENT', 'ASSOCIATION_COMPTEUR', 'DISSOCIATION_COMPTEUR',
                'ASSOCIATION_ABONNEMENT', 'DISSOCIATION_ABONNEMENT', 'ASSOCIATION_CLIENT',
                'DISSOCIATION_CLIENT', 'AJOUT_COSIGNATAIRE', 'SUPPRESSION_COSIGNATAIRE',
                'SIGNATURE_COSIGNATAIRE', 'INTERVENTION_CREEE', 'INTERVENTION_TERMINEE'
            ), 
            allowNull: false 
        },
        details: { type: DataTypes.JSON, allowNull: true }, // Détails de l'action (anciennes/nouvelles valeurs)
        commentaire: { type: DataTypes.TEXT, allowNull: true }, // Commentaire optionnel
        ipAddress: { type: DataTypes.STRING(45), allowNull: true }, // Adresse IP de l'utilisateur
        userAgent: { type: DataTypes.TEXT, allowNull: true }, // User-Agent du navigateur
        dateAction: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        tenantId: { type: DataTypes.STRING, allowNull: true },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true }
    }, {
        sequelize,
        modelName: 'ContratAudit',
        tableName: 'contrat_audits',
        timestamps: false
    });

    return ContratAudit;
}; 