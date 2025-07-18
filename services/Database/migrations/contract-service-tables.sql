-- Supprimer les tables contract bizarres existantes si elles existent
DROP TABLE IF EXISTS contrat_templates CASCADE;
DROP TABLE IF EXISTS contrat CASCADE;
DROP TABLE IF EXISTS contract_templates_old CASCADE;
DROP TABLE IF EXISTS contracts_old CASCADE;

-- Extension pour générer des UUID si elle n'existe pas déjà
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Modèles réutilisables
CREATE TABLE IF NOT EXISTS contract_templates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,                -- ex. "Abonnement eau standard"
    body_md     TEXT        NOT NULL,                 -- Markdown/HTML avec variables
    periodicity VARCHAR(15) NOT NULL DEFAULT 'MENSUEL',
    price       NUMERIC(10,2) NOT NULL,
    created_at  TIMESTAMPTZ  DEFAULT now()
);

-- 2. Contrats générés pour chaque client
CREATE TABLE IF NOT EXISTS contracts (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id     UUID      NOT NULL,                       -- isolation multi-tenant
    client_id     UUID      NOT NULL,
    template_id   UUID      NOT NULL REFERENCES contract_templates(id),
    meter_id      UUID      NULL,                           -- rempli après assignation
    reference     VARCHAR(30) UNIQUE NOT NULL,              -- ex. CTR-2025-0007
    status        VARCHAR(15) NOT NULL DEFAULT 'DRAFT',     -- DRAFT | VALIDATED | SIGNED | TERMINATED
    start_date    DATE      NOT NULL,
    end_date      DATE,
    periodicity   VARCHAR(15) NOT NULL,                     -- copié du template
    price         NUMERIC(10,2) NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now(),
    validated_at  TIMESTAMPTZ,
    signed_at     TIMESTAMPTZ,
    terminated_at TIMESTAMPTZ,
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_contracts_agency ON contracts(agency_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_reference ON contracts(reference);

-- Fonction pour mettre à jour le timestamp updated_at automatiquement
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_contracts_updated_at ON contracts;
CREATE TRIGGER trigger_update_contracts_updated_at
BEFORE UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION update_contracts_updated_at();

-- Insérer quelques templates de démonstration
INSERT INTO contract_templates (name, body_md, periodicity, price, created_at)
VALUES 
('Abonnement eau standard', '# Contrat d''abonnement eau standard\n\nCe contrat établit les conditions de fourniture d''eau entre {{client_name}} et notre société.', 'MENSUEL', 29.99, now()),
('Abonnement eau premium', '# Contrat d''abonnement eau premium\n\nCe contrat premium établit les conditions de fourniture d''eau entre {{client_name}} et notre société, avec services additionnels.', 'MENSUEL', 49.99, now()),
('Maintenance annuelle', '# Contrat de maintenance annuelle\n\nCe contrat établit les conditions de maintenance des équipements pour {{client_name}}.', 'ANNUEL', 120.00, now())
ON CONFLICT DO NOTHING;
