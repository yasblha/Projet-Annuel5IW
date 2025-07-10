import { DataTypes, Model, Sequelize } from 'sequelize';
export default (sequelize: Sequelize): typeof Model => {
    class ContractCosigner extends Model {
        static associate(models: any) {
            ContractCosigner.belongsTo(models.Contrat, { foreignKey: 'contratId', as: 'contrat' });
            // Cosignataire polymorphe
            ContractCosigner.belongsTo(models.Utilisateur, { foreignKey: 'cosignataireId', constraints: false, as: 'user' });
            ContractCosigner.belongsTo(models.Entreprise, { foreignKey: 'cosignataireId', constraints: false, as: 'entreprise' });
        }
    }
    ContractCosigner.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        contratId: { type: DataTypes.UUID, allowNull: false },
        cosignataireId: { type: DataTypes.UUID, allowNull: false },
        typeCosignataire: { type: DataTypes.ENUM('UTILISATEUR','ENTREPRISE'), allowNull: false },
        roleType: { type: DataTypes.ENUM('PRINCIPAL','SECONDARY'), allowNull: false, defaultValue: 'SECONDARY' },
        pourcentageParts: { type: DataTypes.DECIMAL, allowNull: true, defaultValue: 0 },
        statutInvitation: { type: DataTypes.ENUM('ENVOYE','ACCEPTE','REFUSE'), allowNull: false, defaultValue: 'ENVOYE' },
        dateInvitation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateReponse: { type: DataTypes.DATE, allowNull: true },
        signatureElectronique: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        signatureDate: { type: DataTypes.DATE, allowNull: true },
        emailCosignataire: { type: DataTypes.STRING(255), allowNull: true },
        telephoneCosignataire: { type: DataTypes.STRING(30), allowNull: true },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    },{
        sequelize,
        modelName: 'ContractCosigner',
        tableName: 'contract_cosigners',
        timestamps: true,
        createdAt: 'dateInvitation',
        updatedAt: 'dateReponse'
    });
    return ContractCosigner;
};