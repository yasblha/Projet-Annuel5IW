import { DataTypes, Model, Sequelize } from 'sequelize';
export default (sequelize: Sequelize): typeof Model => {
    class Page extends Model {
        static associate(models: any) {
            Page.hasMany(models.PageAction, { foreignKey: 'pageId', as: 'actions' });
        }
    }
    Page.init({
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        key: { type: DataTypes.STRING, allowNull: false, unique: false, comment: 'Identifiant technique de la page' },
        name: { type: DataTypes.STRING, allowNull: false, comment: 'Nom convivial de la page' },
        description: { type: DataTypes.TEXT, allowNull: true }
    }, {
        sequelize,
        modelName: 'Page',
        tableName: 'pages',
        timestamps: false
    });
    return Page;
};