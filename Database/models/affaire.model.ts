import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
  class Affaire extends Model {
    static associate(models: any) {
      Affaire.belongsTo(models.Client, { foreignKey: 'clientId', as: 'client' });
    }
  }

  Affaire.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      clientId: { type: DataTypes.UUID, allowNull: false },
      zoneCode: { type: DataTypes.STRING(4), allowNull: false },
      debitDemande: { type: DataTypes.FLOAT, allowNull: false },
      statut: {
        type: DataTypes.ENUM('EN_COURS', 'VALIDEE', 'REFUSEE'),
        allowNull: false,
        defaultValue: 'EN_COURS',
      },
      montantDevis: { type: DataTypes.FLOAT, allowNull: true },
      devis: { type: DataTypes.JSONB, allowNull: true },
      validationAssainissement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      createdBy: { type: DataTypes.UUID, allowNull: true },
      updatedBy: { type: DataTypes.UUID, allowNull: true },
      tenantId: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Affaire',
      tableName: 'affaires',
      timestamps: false,
    }
  );

  return Affaire;
};
