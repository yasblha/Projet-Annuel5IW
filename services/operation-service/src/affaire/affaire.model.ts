import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface AffaireAttributes {
  id: string;
  clientId: string;
  zoneCode: string;
  debitDemande: number;
  statut: 'EN_COURS' | 'VALIDEE' | 'REFUSEE';
  montantDevis?: number;
  devis?: object;
  validationAssainissement: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type AffaireCreationAttributes = Optional<AffaireAttributes, 'id' | 'statut' | 'validationAssainissement' | 'montantDevis' | 'devis'>;

export class AffaireModel extends Model<AffaireAttributes, AffaireCreationAttributes> implements AffaireAttributes {
  public id!: string;
  public clientId!: string;
  public zoneCode!: string;
  public debitDemande!: number;
  public statut!: 'EN_COURS' | 'VALIDEE' | 'REFUSEE';
  public montantDevis?: number;
  public devis?: object;
  public validationAssainissement!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initAffaireModel = (sequelize: Sequelize) => {
  AffaireModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      clientId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      zoneCode: {
        type: DataTypes.STRING(4),
        allowNull: false,
      },
      debitDemande: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      statut: {
        type: DataTypes.ENUM('EN_COURS', 'VALIDEE', 'REFUSEE'),
        allowNull: false,
        defaultValue: 'EN_COURS',
      },
      montantDevis: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      devis: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      validationAssainissement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'affaires',
    }
  );

  return AffaireModel;
};
