import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize';
import databaseConfig from './database.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
  ],
  providers: [
    {
      provide: 'SEQUELIZE',
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        const sequelize = new Sequelize({
          dialect: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          logging: false,
        });

        // Test the connection
        try {
          await sequelize.authenticate();
          console.log('Database connection has been established successfully.');
          
          // Initialize database schema
          await initializeDatabase(sequelize);
          
          // List all tables in the database
          await listAllTables(sequelize);
        } catch (error) {
          console.error('Unable to connect to the database:', error);
        }

        return sequelize;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SEQUELIZE'],
})
export class DatabaseModule {}

async function initializeDatabase(sequelize: Sequelize) {
  // Create extension for UUID generation if it doesn't exist
  await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  // Create agencies table if it doesn't exist
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS agencies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create users table if it doesn't exist
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

  // Create roles table if it doesn't exist
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(50) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create login_attempts table if it doesn't exist
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL,
      successful BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create clients table if it doesn't exist
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

  // Insert default roles if they don't exist
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

async function listAllTables(sequelize: Sequelize) {
  console.log('\n=== DATABASE TABLES DETECTED ===');
  
  // Get all tables from the public schema
  const [tables] = await sequelize.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  
  if (Array.isArray(tables) && tables.length > 0) {
    tables.forEach((table: any, index: number) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
  } else {
    console.log('No tables found in the database.');
  }
  
  console.log('================================\n');
  
  // Get table details for each table
  for (const table of tables as any[]) {
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
      columns.forEach((column: any) => {
        console.log(`  - ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}${column.column_default ? `, DEFAULT: ${column.column_default}` : ''})`);
      });
    }
    
    console.log('--------------------------------');
  }
}
