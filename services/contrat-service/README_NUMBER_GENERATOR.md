# NumberGeneratorService - Génération d'Identifiants Métier

## 📋 Vue d'ensemble

Le `NumberGeneratorService` implémente la génération d'identifiants métier selon le schéma défini pour le système de gestion de facturation eau/assainissement.

## 🎯 Formats d'Identifiants

### Contrats : `C-<TYPE>-<ZONE>-<YY>-<SEQ>`
- **TYPE** : I (Individuel), P (Particulier), C (Collectivité), A (Administration)
- **ZONE** : Code agence ou INSEE (ex: TLS pour Toulouse)
- **YY** : Année de signature (2 chiffres)
- **SEQ** : Séquence par (type, zone, année) - 5 chiffres

**Exemples :**
- `C-P-TLS-25-00432` : Contrat Particulier Toulouse 2025 #432
- `C-I-PAR-24-00123` : Contrat Individuel Paris 2024 #123
- `C-C-MAR-25-99999` : Contrat Collectivité Marseille 2025 #99999

### Compteurs : `M-<ZONE>-<CAL>-<SERIE>`
- **ZONE** : Code zone (ex: TLS pour Toulouse)
- **CAL** : Calibre du compteur (ex: 40 pour 40mm)
- **SERIE** : Numéro de série constructeur (7 chiffres, zéro-pad)

**Exemples :**
- `M-TLS-40-0723456` : Compteur Toulouse Calibre 40 #0723456
- `M-PAR-25-0000001` : Compteur Paris Calibre 25 #0000001

## 🔧 Utilisation

### Injection du Service
```typescript
constructor(
  private readonly numberGenerator: NumberGenerator
) {}
```

### Génération d'un Numéro de Contrat
```typescript
// Générer un numéro de contrat
const numero = await this.numberGenerator.nextContractNumber('P', 'TLS');
// Résultat: "C-P-TLS-25-00432"
```

### Génération d'un Identifiant de Compteur
```typescript
// Générer un identifiant de compteur
const compteurId = this.numberGenerator.nextCompteurNumber('TLS', '40', '723456');
// Résultat: "M-TLS-40-0723456"
```

### Validation de Formats
```typescript
// Valider un numéro de contrat
const isValid = this.numberGenerator.validateContractNumber('C-P-TLS-25-00432');
// Résultat: true

// Valider un identifiant de compteur
const isValidCompteur = this.numberGenerator.validateCompteurNumber('M-TLS-40-0723456');
// Résultat: true
```

### Parsing d'un Numéro de Contrat
```typescript
// Extraire les composants d'un numéro
const components = this.numberGenerator.parseContractNumber('C-P-TLS-25-00432');
// Résultat: { type: 'P', zone: 'TLS', year: '25', seq: 432 }
```

## 🗄️ Structure de la Base de Données

### Table `contract_counters`
```sql
CREATE TABLE contract_counters (
  type_code  CHAR(1),      -- Type de contrat (I/P/C/A)
  zone_code  VARCHAR(4),    -- Code zone
  year_short CHAR(2),       -- Année (YY)
  seq        INT NOT NULL DEFAULT 1,  -- Séquence
  PRIMARY KEY (type_code, zone_code, year_short)
);
```

### Migration Ajoutée
- **Fichier** : `Database/migrations/20241207_add_type_code_to_contract_counters.js`
- **Action** : Ajoute le champ `type_code` et met à jour la clé primaire
- **Rollback** : Restaure l'ancienne structure

## 🚀 Endpoints API

### Créer un Contrat avec Numéro Métier
```http
POST /contrats/metier
Content-Type: application/json

{
  "proprietaireId": "uuid",
  "typeContrat": "P",
  "zone": "TLS",
  "dateDebut": "2025-01-01",
  "objet": "Contrat de fourniture d'eau",
  "montantTotal": 1200.00
}
```

**Réponse :**
```json
{
  "id": "uuid",
  "numero": "C-P-TLS-25-00432",
  "typeContrat": "P",
  "zone": "TLS",
  "statut": "EN_ATTENTE",
  "dateDebut": "2025-01-01T00:00:00.000Z",
  "objet": "Contrat de fourniture d'eau",
  "montantTotal": 1200.00
}
```

## 🔒 Gestion de la Concurrence

Le service utilise des transactions SQL pour garantir l'unicité des numéros :

```typescript
const nextSeq = await sequelize.transaction(async (tx) => {
  const [counter] = await ContractCounter.findOrCreate({
    where: { type_code: type, zone_code: zone, year_short: year },
    defaults: { seq: 1 },
    transaction: tx,
  });
  
  counter.seq += 1;
  await counter.save({ transaction: tx });
  return counter.seq;
});
```

## ✅ Tests

Le service inclut des tests unitaires complets :

```bash
# Exécuter les tests
npm test -- --testPathPattern=number-generator.service.spec.ts
```

**Tests couverts :**
- ✅ Génération de numéros de contrat
- ✅ Génération d'identifiants de compteur
- ✅ Validation de formats
- ✅ Parsing de numéros
- ✅ Gestion des erreurs

## 📊 Avantages Métier

1. **Lisibilité** : Numéros immédiatement compréhensibles
2. **Unicité** : Garantie par clé composite + transactions
3. **Filtrage** : Recherche simple par type/zone/année
4. **Extensibilité** : Ajout facile de nouveaux types/zones
5. **Traçabilité** : Historique complet des générations

## 🔄 Migration depuis l'Ancien Format

### Ancien Format
```
C-TLS-25-00432  // Sans type
```

### Nouveau Format
```
C-P-TLS-25-00432  // Avec type
```

**Migration automatique :**
- Les anciens numéros restent valides
- Les nouveaux contrats utilisent le format étendu
- Pas d'impact sur les données existantes

## 🎯 Prochaines Étapes

1. **Intégration complète** dans le workflow de création
2. **Validation métier** avant activation
3. **Génération automatique** lors de la finalisation
4. **Intégration inter-services** pour les interventions 