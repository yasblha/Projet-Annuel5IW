import { DataTypes, Model, Sequelize } from 'sequelize';
export default (sequelize: Sequelize): typeof Model => {
    class PageAction extends Model {
        static associate(models: any) {
            PageAction.belongsTo(models.Page, { foreignKey: 'pageId', as: 'page' });
            PageAction.belongsTo(models.Action, { foreignKey: 'actionId', as: 'action' });
            PageAction.hasMany(models.RolePagePermission, { foreignKey: 'pageActionId', as: 'rolePermissions' });
        }
    }
    PageAction.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        pageId: { type: DataTypes.UUID, allowNull: false },
        actionId: { type: DataTypes.UUID, allowNull: false },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'PageAction',
        tableName: 'page_actions',
        timestamps: false,
        indexes: [{ unique: true, fields: ['pageId','actionId'] }]
    });
    return PageAction;
};
