import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class ContractCounter extends Model {
      declare type_code: string;
      declare zone_code: string;
      declare year_short: string;
      declare seq: number;
      declare dateCreation: Date;
      declare dateMaj: Date;
      declare createdBy: string;
      declare updatedBy: string;
      declare tenantId: string;
    }

    ContractCounter.init({
      type_code:  { type: DataTypes.CHAR(1), primaryKey: true },
      zone_code:  { type: DataTypes.STRING(4), primaryKey: true },
      year_short: { type: DataTypes.CHAR(2), primaryKey: true },
      seq:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      createdBy: { type: DataTypes.UUID, allowNull: true },
      updatedBy: { type: DataTypes.UUID, allowNull: true },
      tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
      sequelize,
      modelName: 'ContractCounter',
      tableName: 'contract_counters',
      timestamps: false
    });

    return ContractCounter;
};