-- Script d'insertion de compteurs pour la facturation
-- À exécuter dans le container PostgreSQL

-- Insertion de compteurs pour les 10 premiers contrats actifs
WITH contrats_actifs AS (
  SELECT id, numero, zone, "tenantId"
  FROM contrats
  WHERE statut = 'ACTIF'
  LIMIT 10
)
INSERT INTO compteurs (
  id, serial, type, statut, emplacement, "dateInstallation", 
  "dateDernierReleve", "valeurDernierReleve", marque, modele, 
  "dateCreation", "dateMaj", "tenantId"
)
SELECT 
  gen_random_uuid(), 
  'METER-' || ca.zone || '-' || floor(random() * 90000 + 10000)::text, 
  'EAU_POTABLE', 
  'ACTIF', 
  'ENTRÉE PRINCIPALE', 
  CURRENT_DATE, 
  CURRENT_DATE, 
  floor(random() * 100), 
  'AquaTech', 
  'Smart-X200', 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP, 
  ca."tenantId"
FROM contrats_actifs ca
RETURNING id, serial;

-- Associer les compteurs créés aux contrats dans l'historique
WITH derniers_compteurs AS (
  SELECT c.id as compteur_id, 
         ROW_NUMBER() OVER (ORDER BY c."dateCreation" DESC) as rn,
         (SELECT id FROM contrats WHERE statut = 'ACTIF' LIMIT 10 OFFSET (ROW_NUMBER() OVER (ORDER BY c."dateCreation" DESC) - 1)) as contrat_id,
         c."tenantId"
  FROM compteurs c
  ORDER BY c."dateCreation" DESC
  LIMIT 10
)
INSERT INTO contrat_compteur_historiques (
  id, "contratId", "compteurId", "typeAction", 
  "dateDebut", motif, "tenantId", 
  "dateCreation", "dateMaj"
)
SELECT
  gen_random_uuid(),
  dc.contrat_id,
  dc.compteur_id,
  'ASSOCIATION',
  CURRENT_DATE,
  'Installation initiale',
  dc."tenantId",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM derniers_compteurs dc;

-- Afficher les compteurs créés avec leurs contrats associés
SELECT 
  c.id as compteur_id,
  c.serial,
  c.type,
  c."valeurDernierReleve",
  co.numero as contrat_numero,
  cch."dateDebut" as date_association
FROM compteurs c
JOIN contrat_compteur_historiques cch ON c.id = cch."compteurId"
JOIN contrats co ON co.id = cch."contratId"
WHERE cch."typeAction" = 'ASSOCIATION'
ORDER BY cch."dateCreation" DESC
LIMIT 10;
