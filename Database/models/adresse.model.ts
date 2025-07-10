import { DataTypes, Model, Sequelize } from 'sequelize';

export default function initAdresse(sequelize: Sequelize): typeof Model {
    class Adresse extends Model {
        static associate(models: any) {
            // Associations avec utilisateurs (système)
            Adresse.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });
            // Associations avec clients
            Adresse.belongsTo(models.Client, { foreignKey: 'clientId', as: 'client' });
        }
    }

    Adresse.init({
        id: { 
            type: DataTypes.UUID, 
            primaryKey: true, 
            defaultValue: DataTypes.UUIDV4 
        },
        // Clés étrangères (une seule sera utilisée selon le contexte)
        utilisateurId: { 
            type: DataTypes.UUID, 
            allowNull: true,
            references: { model: 'utilisateurs', key: 'id' }
        },
        clientId: { 
            type: DataTypes.UUID, 
            allowNull: true,
            references: { model: 'clients', key: 'id' }
        },
        type: { 
            type: DataTypes.ENUM('PRINCIPALE', 'FACTURATION', 'LIVRAISON'), 
            allowNull: false,
            defaultValue: 'PRINCIPALE'
        },
        ligne1: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        ligne2: { 
            type: DataTypes.STRING, 
            allowNull: true 
        },
        codePostal: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        ville: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        pays: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            defaultValue: 'FR' 
        },
        dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateMaj: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdBy: { type: DataTypes.UUID, allowNull: true },
        updatedBy: { type: DataTypes.UUID, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    }, {
        sequelize,
        modelName: 'Adresse',
        tableName: 'adresses',
        timestamps: false,
    });

    return Adresse;
}