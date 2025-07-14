import { Sequelize, Op, fn, col } from 'sequelize';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export { Op, fn, col };

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DATABASE_NAME || process.env.DB_NAME || 'aquaerp',
    process.env.DATABASE_USERNAME || process.env.DB_USER || 'aquaerp',
    process.env.DATABASE_PASSWORD || process.env.DB_PASS || 'aquaerppassword',
    {
        host: process.env.DB_HOST || process.env.DB_HOST || 'postgres-service',
        port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '5432'),
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

        console.log('Fichiers de modèles trouvés:', files);
        
        for (const file of files) {
            try {
                console.log(`Tentative de chargement du modèle depuis: ${file}`);
                const modulePath = path.join(modelsPath, file);
                const moduleExports = require(modulePath);
                
                if (!moduleExports || !moduleExports.default) {
                    console.warn(`⚠️  Aucune exportation par défaut dans ${file}`);
                    continue;
                }
                
                const initFn = moduleExports.default;
                if (typeof initFn !== 'function') {
                    console.warn(`⚠️  L'export par défaut de ${file} n'est pas une fonction`);
                    continue;
                }
                
                console.log(`Initialisation du modèle depuis: ${file}`);
                const model = initFn(sequelize);
                if (!model || !model.name) {
                    console.warn(`⚠️  Le modèle de ${file} n'a pas de propriété 'name' valide`);
                    continue;
                }
                
                models[model.name] = model;
                console.log(`✅ Modèle chargé: ${model.name} (${file})`);
            } catch (error) {
                console.error(`❌ Erreur lors du chargement du modèle ${file}:`, error);
            }
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
