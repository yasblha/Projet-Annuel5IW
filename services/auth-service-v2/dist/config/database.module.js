"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("./database.config"));
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forFeature(database_config_1.default),
        ],
        providers: [
            {
                provide: 'SEQUELIZE',
                useFactory: async (configService) => {
                    const dbConfig = configService.get('database');
                    const sequelize = new sequelize_1.Sequelize({
                        dialect: 'postgres',
                        host: dbConfig.host,
                        port: dbConfig.port,
                        username: dbConfig.username,
                        password: dbConfig.password,
                        database: dbConfig.database,
                        logging: false,
                    });
                    try {
                        await sequelize.authenticate();
                        console.log('Database connection has been established successfully.');
                        await initializeDatabase(sequelize);
                        await listAllTables(sequelize);
                    }
                    catch (error) {
                        console.error('Unable to connect to the database:', error);
                    }
                    return sequelize;
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: ['SEQUELIZE'],
    })
], DatabaseModule);
async function initializeDatabase(sequelize) {
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS agencies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255),
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      role VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      agency_id UUID NOT NULL,
      activation_token VARCHAR(255),
      reset_token VARCHAR(255),
      password_last_changed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agency_id) REFERENCES agencies(id)
    );
  `);
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(50) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL,
      successful BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      agency_id UUID NOT NULL REFERENCES agencies(id),
      type VARCHAR(20) NOT NULL DEFAULT 'PARTICULIER' CHECK (type IN ('PARTICULIER', 'ENTREPRISE')),
      statut VARCHAR(20) NOT NULL DEFAULT 'PROSPECT' CHECK (statut IN ('PROSPECT', 'ACTIF', 'SUSPENDU', 'INACTIF', 'RESILIE', 'ARCHIVE')),
      nom VARCHAR(100) NOT NULL,
      prenom VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      telephone VARCHAR(20),
      adresse_ligne1 VARCHAR(255),
      adresse_ligne2 VARCHAR(255),
      code_postal VARCHAR(10),
      ville VARCHAR(100),
      pays VARCHAR(100) DEFAULT 'France',
      impaye DECIMAL(10, 2) DEFAULT 0,
      factures_impayees INTEGER DEFAULT 0,
      dernier_paiement TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP,
      CONSTRAINT unique_client_email_per_agency UNIQUE (email, agency_id)
    );

    -- Index pour améliorer les performances des recherches
    CREATE INDEX IF NOT EXISTS idx_clients_agency_id ON clients(agency_id);
    CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
    CREATE INDEX IF NOT EXISTS idx_clients_nom_prenom ON clients(nom, prenom);
    CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut);
    CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
    CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at);
  `);
    const defaultRoles = ['ADMIN', 'USER', 'MANAGER'];
    for (const role of defaultRoles) {
        await sequelize.query(`
      INSERT INTO roles (name, description)
      VALUES (:name, :description)
      ON CONFLICT (name) DO NOTHING;
    `, {
            replacements: {
                name: role,
                description: `${role} role`,
            },
        });
    }
}
async function listAllTables(sequelize) {
    console.log('\n=== DATABASE TABLES DETECTED ===');
    const [tables] = await sequelize.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
    if (Array.isArray(tables) && tables.length > 0) {
        tables.forEach((table, index) => {
            console.log(`${index + 1}. ${table.table_name}`);
        });
    }
    else {
        console.log('No tables found in the database.');
    }
    console.log('================================\n');
    for (const table of tables) {
        const tableName = table.table_name;
        const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = :tableName
      ORDER BY ordinal_position;
    `, {
            replacements: { tableName },
        });
        console.log(`\nTable: ${tableName}`);
        console.log('Columns:');
        if (Array.isArray(columns) && columns.length > 0) {
            columns.forEach((column) => {
                console.log(`  - ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}${column.column_default ? `, DEFAULT: ${column.column_default}` : ''})`);
            });
        }
        console.log('--------------------------------');
    }
}
//# sourceMappingURL=database.module.js.map