import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

// Définition des attributs du modèle
interface ContractCounterAttributes {
  type_code: string;
  zone_code: string;
  year_short: string;
  seq: number;
  dateCreation: Date;
  dateMaj: Date;
  createdBy?: string;
  updatedBy?: string;
  tenantId?: string;
}

// Attributs nécessaires pour la création d'une nouvelle ligne (les clés primaires sont toutes requises)
interface ContractCounterCreationAttributes extends Optional<ContractCounterAttributes, 'seq' | 'dateCreation' | 'dateMaj' | 'createdBy' | 'updatedBy' | 'tenantId'> {}

// On place la classe en dehors de la fonction afin de pouvoir l'utiliser comme type de retour
class ContractCounter extends Model<ContractCounterAttributes, ContractCounterCreationAttributes> implements ContractCounterAttributes {
  public type_code!: string;
  public zone_code!: string;
  public year_short!: string;
  public seq!: number;
  public dateCreation!: Date;
  public dateMaj!: Date;
  public createdBy?: string;
  public updatedBy?: string;
  public tenantId?: string;
}

export default (sequelize: Sequelize): typeof ContractCounter => {
  ContractCounter.init(
    {
      type_code:  { type: DataTypes.CHAR(1), primaryKey: true },
      zone_code:  { type: DataTypes.STRING(4), primaryKey: true },
      year_short: { type: DataTypes.CHAR(2), primaryKey: true },
      seq:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      createdBy: { type: DataTypes.UUID, allowNull: true },
      updatedBy: { type: DataTypes.UUID, allowNull: true },
      tenantId: { type: DataTypes.STRING, allowNull: true }
    },
    {
      sequelize,
      modelName: 'ContractCounter',
      tableName: 'contract_counters',
      timestamps: false
    }
  );

  return ContractCounter;
};