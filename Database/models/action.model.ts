import { DataTypes, Model, Sequelize } from 'sequelize';
export default (sequelize: Sequelize): typeof Model => {
    class Action extends Model {
        static associate(models: any) {
            Action.hasMany(models.PageAction, { foreignKey: 'actionId', as: 'pages' });
        }
    }
    Action.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        name: {
            type: DataTypes.ENUM('CREATE', 'READ', 'UPDATE', 'DELETE'),
            allowNull: false,
            unique: false
        },
        description: { type: DataTypes.TEXT, allowNull: true },
        categorie: { type: DataTypes.STRING(50), allowNull: true },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Action',
        tableName: 'actions',
        timestamps: false
    });
    return Action;
};