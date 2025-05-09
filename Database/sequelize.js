"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = exports.initDatabase = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();
exports.sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || 'main', process.env.DB_USER || 'postgres', process.env.DB_PASS || 'postgres', {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
});
const models = {};
exports.models = models;
const initDatabase = async () => {
    try {
        const modelsPath = path.resolve(__dirname, 'models');
        const files = fs.readdirSync(modelsPath).filter((file) => file.endsWith('.model.ts') || file.endsWith('.model.js'));
        for (const file of files) {
            const modelModule = await Promise.resolve(`${path.join(modelsPath, file)}`).then(s => require(s));
            const initFn = modelModule.initModel || Object.values(modelModule).find(fn => typeof fn === 'function');
            if (typeof initFn === 'function') {
                const model = initFn(exports.sequelize);
                const modelName = model?.name || path.basename(file, '.model.ts');
                models[modelName] = model;
            }
            else {
                console.warn(`⚠️  No initModel function found in ${file}`);
            }
        }
        await exports.sequelize.authenticate();
        console.log('✅ Connection to database established');
        await exports.sequelize.sync({ alter: true });
        console.log('✅ Models synchronized');
    }
    catch (err) {
        console.error('❌ Database initialization failed:', err);
        process.exit(1);
    }
};
exports.initDatabase = initDatabase;
//# sourceMappingURL=sequelize.js.map