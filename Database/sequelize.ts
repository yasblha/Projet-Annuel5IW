import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME || 'main',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'postgres',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
    }
);

export const models: Record<string, any> = {};

export const initDatabase = async () => {
    try {
        const modelsPath = path.resolve(__dirname, 'models');
        console.log('→ Chargement des modèles depuis', modelsPath);

        const files = fs
            .readdirSync(modelsPath)
            .filter(f => /\.(model\.(ts|js))$/.test(f));

        for (const file of files) {
            const initFn = require(path.join(modelsPath, file)).default;
            if (typeof initFn !== 'function') {
                console.warn(`⚠️  Aucun initFn exporté par défaut dans ${file}`);
                continue;
            }
            const model = initFn(sequelize);
            models[model.name] = model;
            console.log(`🔄 Modèle chargé: ${model.name}`);
        }

        Object.values(models).forEach(m => {
            if (typeof m.associate === 'function') {
                m.associate(models);
                console.log(`🔗 Associations appliquées pour: ${m.name}`);
            }
        });

        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données établie');

        await sequelize.sync({ alter: true, force:true });
        console.log('✅ Synchronisation des modèles terminée');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
        process.exit(1);
    }
};
