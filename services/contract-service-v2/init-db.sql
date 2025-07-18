-- Supprimer les tables contract bizarres existantes si elles existent
DROP TABLE IF EXISTS contrat_templates CASCADE;
DROP TABLE IF EXISTS contrat CASCADE;
DROP TABLE IF EXISTS contract_templates_old CASCADE;
DROP TABLE IF EXISTS contracts_old CASCADE;
DROP TABLE IF EXISTS contract_history CASCADE;

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

-- 3. Historique des modifications de contrats
CREATE TABLE IF NOT EXISTS contract_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id     UUID NOT NULL REFERENCES contracts(id),
    agency_id       UUID NOT NULL,                          -- isolation multi-tenant
    action          VARCHAR(50) NOT NULL,                   -- CREATE, UPDATE_STATUS, UPDATE_METER, etc.
    old_status      VARCHAR(15),
    new_status      VARCHAR(15),
    old_meter_id    UUID,
    new_meter_id    UUID,
    old_price       NUMERIC(10,2),
    new_price       NUMERIC(10,2),
    comment         TEXT,
    created_by      UUID,                                   -- ID de l'utilisateur qui a effectué l'action
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_contracts_agency ON contracts(agency_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_reference ON contracts(reference);
CREATE INDEX IF NOT EXISTS idx_contract_history_contract ON contract_history(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_history_agency ON contract_history(agency_id);
CREATE INDEX IF NOT EXISTS idx_contract_history_action ON contract_history(action);

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

-- Fonction pour enregistrer les modifications de contrats dans l'historique
CREATE OR REPLACE FUNCTION log_contract_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_type VARCHAR(50);
  comment_text TEXT;
BEGIN
  -- Déterminer le type d'action
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATE';
    comment_text := 'Création du contrat';
    
    -- Insérer dans l'historique
    INSERT INTO contract_history (
      contract_id, agency_id, action, new_status, new_meter_id, new_price, comment
    ) VALUES (
      NEW.id, NEW.agency_id, action_type, NEW.status, NEW.meter_id, NEW.price, comment_text
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Changement de statut
    IF OLD.status <> NEW.status THEN
      action_type := 'UPDATE_STATUS';
      
      CASE NEW.status
        WHEN 'VALIDATED' THEN comment_text := 'Contrat validé';
        WHEN 'SIGNED' THEN comment_text := 'Contrat signé';
        WHEN 'TERMINATED' THEN comment_text := 'Contrat résilié';
        ELSE comment_text := 'Statut modifié de ' || OLD.status || ' à ' || NEW.status;
      END CASE;
      
      INSERT INTO contract_history (
        contract_id, agency_id, action, old_status, new_status, comment
      ) VALUES (
        NEW.id, NEW.agency_id, action_type, OLD.status, NEW.status, comment_text
      );
    END IF;
    
    -- Changement de compteur
    IF (OLD.meter_id IS NULL AND NEW.meter_id IS NOT NULL) OR 
       (OLD.meter_id IS NOT NULL AND NEW.meter_id IS NULL) OR
       (OLD.meter_id IS NOT NULL AND NEW.meter_id IS NOT NULL AND OLD.meter_id <> NEW.meter_id) THEN
      
      action_type := 'UPDATE_METER';
      comment_text := 'Compteur modifié';
      
      INSERT INTO contract_history (
        contract_id, agency_id, action, old_meter_id, new_meter_id, comment
      ) VALUES (
        NEW.id, NEW.agency_id, action_type, OLD.meter_id, NEW.meter_id, comment_text
      );
    END IF;
    
    -- Changement de prix
    IF OLD.price <> NEW.price THEN
      action_type := 'UPDATE_PRICE';
      comment_text := 'Prix modifié de ' || OLD.price || ' à ' || NEW.price;
      
      INSERT INTO contract_history (
        contract_id, agency_id, action, old_price, new_price, comment
      ) VALUES (
        NEW.id, NEW.agency_id, action_type, OLD.price, NEW.price, comment_text
      );
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour enregistrer les modifications dans l'historique
DROP TRIGGER IF EXISTS trigger_log_contract_changes ON contracts;
CREATE TRIGGER trigger_log_contract_changes
AFTER INSERT OR UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION log_contract_changes();

-- Insérer quelques templates de démonstration
INSERT INTO contract_templates (name, body_md, periodicity, price, created_at)
VALUES 
('Abonnement eau standard', '# Contrat d''abonnement eau standard\n\nCe contrat établit les conditions de fourniture d''eau entre {{client_name}} et notre société.', 'MENSUEL', 29.99, now()),
('Abonnement eau premium', '# Contrat d''abonnement eau premium\n\nCe contrat premium établit les conditions de fourniture d''eau entre {{client_name}} et notre société, avec services additionnels.', 'MENSUEL', 49.99, now()),
('Maintenance annuelle', '# Contrat de maintenance annuelle\n\nCe contrat établit les conditions de maintenance des équipements pour {{client_name}}.', 'ANNUEL', 120.00, now())
ON CONFLICT DO NOTHING;
