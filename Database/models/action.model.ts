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
        }
    }, {
        sequelize,
        modelName: 'Action',
        tableName: 'actions',
        timestamps: false
    });
    return Action;
};