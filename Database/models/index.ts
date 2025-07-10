import { Sequelize } from 'sequelize';
const config = require('../config/config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false
  }
);

// Import des modèles
import initUser from './user.model';
import initAdresse from './adresse.model';
import initClient from './client.model';
import initEntreprise from './entreprise.model';
import initContrat from './contrat.model';
import initFacture from './facture.model';
import initAbonnement from './abonnement.model';
import initCompteur from './compteur.model';
import initTarif from './tarif.model';
import initIntervention from './intervention.model';
import initPaiement from './paiement.model';
import initLettrage from './lettrage.model';
import initLigneFacture from './ligneFacture.model';
import initLotFacturation from './lotFacturation.model';
import initContratCosignataire from './contratCosignataire.model';
import initPage from './page.model';
import initAction from './action.model';
import initRolePagePermission from './rolePagePermission.model';
import initPageAction from './pageAction.model';
import initContractCounter from './ContractCounter.model';

// Initialisation des modèles
const User = initUser(sequelize);
const Adresse = initAdresse(sequelize);
const Client = initClient(sequelize);
const Entreprise = initEntreprise(sequelize);
const Contrat = initContrat(sequelize);
const Facture = initFacture(sequelize);
const Abonnement = initAbonnement(sequelize);
const Compteur = initCompteur(sequelize);
const Tarif = initTarif(sequelize);
const Intervention = initIntervention(sequelize);
const Paiement = initPaiement(sequelize);
const Lettrage = initLettrage(sequelize);
const LigneFacture = initLigneFacture(sequelize);
const LotFacturation = initLotFacturation(sequelize);
const ContratCosignataire = initContratCosignataire(sequelize);
const Page = initPage(sequelize);
const Action = initAction(sequelize);
const RolePagePermission = initRolePagePermission(sequelize);
const PageAction = initPageAction(sequelize);
const ContractCounter = initContractCounter(sequelize);

// Établissement des associations
const models = {
  User,
  Adresse,
  Client,
  Entreprise,
  Contrat,
  Facture,
  Abonnement,
  Compteur,
  Tarif,
  Intervention,
  Paiement,
  Lettrage,
  LigneFacture,
  LotFacturation,
  ContratCosignataire,
  Page,
  Action,
  RolePagePermission,
  PageAction,
  ContractCounter
};

// Appel des méthodes associate pour établir les relations
Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

export {
  sequelize,
  User,
  Adresse,
  Client,
  Entreprise,
  Contrat,
  Facture,
  Abonnement,
  Compteur,
  Tarif,
  Intervention,
  Paiement,
  Lettrage,
  LigneFacture,
  LotFacturation,
  ContratCosignataire,
  Page,
  Action,
  RolePagePermission,
  PageAction,
  ContractCounter
};

export default models; 