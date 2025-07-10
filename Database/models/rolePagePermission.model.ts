import { DataTypes, Model, Sequelize } from 'sequelize';
export default (sequelize: Sequelize): typeof Model => {
    class RolePagePermission extends Model {
        static associate(models: any) {
            RolePagePermission.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
            RolePagePermission.belongsTo(models.PageAction, { foreignKey: 'pageActionId', as: 'pageAction' });
        }
    }
    RolePagePermission.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        roleId: { type: DataTypes.UUID, allowNull: false },
        pageActionId: { type: DataTypes.UUID, allowNull: false },
        allowed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'RolePagePermission',
        tableName: 'role_page_permissions',
        timestamps: false,
        indexes: [{ unique: true, fields: ['roleId','pageActionId'] }]
    });
    return RolePagePermission;
};
