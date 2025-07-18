-- Création de la table clients
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

-- Fonction pour mettre à jour le timestamp updated_at automatiquement
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp updated_at automatiquement
CREATE TRIGGER trigger_update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_clients_updated_at();
