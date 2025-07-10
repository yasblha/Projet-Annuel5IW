import { Op } from 'sequelize';
import { models } from '../sequelize';

type ClientInstance = typeof models.Client;

export interface CreateClientParams {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    type: 'PARTICULIER' | 'ENTREPRISE';
    statut?: 'PROSPECT' | 'ACTIF' | 'SUSPENDU' | 'INACTIF' | 'RESILIE' | 'ARCHIVE';
    statutContractuel?: 'SANS_CONTRAT' | 'EN_NEGOCIATION' | 'EN_ATTENTE_SIGNATURE' | 'CONTRAT_ACTIF' | 'CONTRAT_SUSPENDU' | 'CONTRAT_RESILIE' | 'CONTRAT_EXPIRE';
    statutPaiement?: 'A_JOUR' | 'RETARD_LEGER' | 'RETARD_MODERE' | 'RETARD_IMPORTANT' | 'IMPAYE' | 'EN_PROCEDURE' | 'LITIGE';
    statutTechnique?: 'OPERATIONNEL' | 'MAINTENANCE' | 'DEFAILLANT' | 'COUPURE' | 'INSTALLATION' | 'DEMENAGEMENT';
    statutAbonnement?: 'SANS_ABONNEMENT' | 'ABONNEMENT_ACTIF' | 'ABONNEMENT_SUSPENDU' | 'ABONNEMENT_EXPIRE' | 'EN_CREATION';
    statutFacturation?: 'FACTURATION_NORMALE' | 'FACTURATION_SUSPENDUE' | 'FACTURATION_ESTIMEE' | 'FACTURATION_ANNULEE';
    montantImpaye?: number;
    dateDernierPaiement?: Date;
    dateDerniereFacture?: Date;
    nombreFacturesImpayees?: number;
    tenantId?: string;
    proprietaireEntrepriseId?: string;
}

export interface ListClientsParams {
    page?: number;
    limit?: number;
    search?: string; // Recherche globale
    // Identité
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    role?: string;
    statut?: string;
    
    // Statuts métier
    statutContractuel?: string;
    statutPaiement?: string;
    statutTechnique?: string;
    statutAbonnement?: string;
    statutFacturation?: string;
    
    // Informations financières
    montantImpayeMin?: number;
    montantImpayeMax?: number;
    nombreFacturesImpayeesMin?: number;
    nombreFacturesImpayeesMax?: number;
    
    // Adresse
    ligne1?: string;
    ligne2?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
    typeAdresse?: string;
    
    // Compteur et Abonnement
    numeroCompteur?: string;
    typeCompteur?: string;
    statutCompteur?: string;
    emplacementCompteur?: string;
    dateDebutAbonnement?: string;
    dateFinAbonnement?: string;
    frequenceAbonnement?: string;
    
    // Contrat
    numeroContrat?: string;
    statutContrat?: string;
    typeProprietaire?: string;
    dateDebutContrat?: string;
    dateFinContrat?: string;
    
    // Entreprise
    nomEntreprise?: string;
    siret?: string;
    contactEmail?: string;
    contactTelephone?: string;
    
    // Facturation
    numeroFacture?: string;
    montantHT?: string;
    dateEmission?: string;
    dateEcheance?: string;
    
    // Interventions
    typeIntervention?: string;
    statutIntervention?: string;
    datePlanifiee?: string;
    dateRealisee?: string;
}

export class ClientRepository {
    private readonly repo = models.Client;

    /** Crée un nouveau client */
    async create(data: CreateClientParams): Promise<ClientInstance> {
        return this.repo.create(data);
    }

    /** Recherche un client par son ID */
    async findById(id: string): Promise<ClientInstance | null> {
        return this.repo.findByPk(id);
    }

    /** Recherche un client par email (insensible à la casse) */
    async findByEmail(email: string): Promise<ClientInstance | null> {
        return this.repo.findOne({ 
            where: { email: { [Op.iLike]: email } }
        });
    }

    /** Recherche un client par téléphone */
    async findByPhone(telephone: string): Promise<ClientInstance | null> {
        return this.repo.findOne({ 
            where: { telephone }
        });
    }

    /** Liste paginée et filtrée des clients avec recherche avancée */
    async listClients(params: ListClientsParams): Promise<any> {
        const page = params.page ?? 1;
        const limit = params.limit ?? 10;
        const offset = (page - 1) * limit;
        
        // Construction des conditions de recherche
        const where: any = {};

        // Filtres sur le client lui-même
        if (params.nom) where.nom = { [Op.iLike]: `%${params.nom}%` };
        if (params.prenom) where.prenom = { [Op.iLike]: `%${params.prenom}%` };
        if (params.email) where.email = { [Op.iLike]: `%${params.email}%` };
        if (params.telephone) where.telephone = { [Op.iLike]: `%${params.telephone}%` };
        if (params.statut) where.statut = params.statut;
        if (params.role) where.role = params.role;

        // Filtres sur les statuts métier
        if (params.statutContractuel) where.statutContractuel = params.statutContractuel;
        if (params.statutPaiement) where.statutPaiement = params.statutPaiement;
        if (params.statutTechnique) where.statutTechnique = params.statutTechnique;
        if (params.statutAbonnement) where.statutAbonnement = params.statutAbonnement;
        if (params.statutFacturation) where.statutFacturation = params.statutFacturation;

        // Filtres sur les informations financières
        if (params.montantImpayeMin || params.montantImpayeMax) {
            where.montantImpaye = {};
            if (params.montantImpayeMin) where.montantImpaye[Op.gte] = params.montantImpayeMin;
            if (params.montantImpayeMax) where.montantImpaye[Op.lte] = params.montantImpayeMax;
        }
        if (params.nombreFacturesImpayeesMin || params.nombreFacturesImpayeesMax) {
            where.nombreFacturesImpayees = {};
            if (params.nombreFacturesImpayeesMin) where.nombreFacturesImpayees[Op.gte] = params.nombreFacturesImpayeesMin;
            if (params.nombreFacturesImpayeesMax) where.nombreFacturesImpayees[Op.lte] = params.nombreFacturesImpayeesMax;
        }

        // Recherche globale (nom, prénom, email)
        if (params.search) {
            where[Op.or] = [
                { nom: { [Op.iLike]: `%${params.search}%` } },
                { prenom: { [Op.iLike]: `%${params.search}%` } },
                { email: { [Op.iLike]: `%${params.search}%` } },
                { telephone: { [Op.iLike]: `%${params.search}%` } }
            ];
        }
        
        const { rows, count } = await this.repo.findAndCountAll({
            where,
            offset,
            limit,
            order: [['dateCreation', 'DESC']],
        });
        
        return {
            clients: rows,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        };
    }

    /** Met à jour un client */
    async update(id: string, data: Partial<CreateClientParams>): Promise<ClientInstance | null> {
        const [count] = await this.repo.update(data, { where: { id } });
        if (count === 0) return null;
        return this.findById(id);
    }

    /** Supprime un client */
    async delete(id: string): Promise<boolean> {
        const count = await this.repo.destroy({ where: { id } });
        return count > 0;
    }

    /** Calcule et met à jour les statuts métier d'un client */
    async calculerStatutsMetier(clientId: string): Promise<void> {
        const client = await this.findById(clientId);
        if (!client) return;

        // Récupérer les données du client
        const contrats = await models.Contrat.findAll({ where: { proprietaireId: clientId } });
        const factures = await models.Facture.findAll({ where: { clientId } });
        const abonnements = await models.Abonnement.findAll({ where: { utilisateurId: clientId } });
        const paiements = await models.Paiement.findAll({
            include: [{ model: models.Facture, where: { clientId } }]
        });

        // Calculer le statut contractuel
        const statutContractuel = this.calculerStatutContractuel(contrats);
        
        // Calculer le statut de paiement
        const { statutPaiement, montantImpaye, nombreFacturesImpayees } = this.calculerStatutPaiement(factures, paiements);
        
        // Calculer le statut d'abonnement
        const statutAbonnement = this.calculerStatutAbonnement(abonnements);
        
        // Calculer le statut de facturation
        const statutFacturation = this.calculerStatutFacturation(factures);
        
        // Calculer le statut technique (basé sur les compteurs)
        const statutTechnique = this.calculerStatutTechnique(abonnements);

        // Mettre à jour le client
        await this.update(clientId, {
            statutContractuel,
            statutPaiement,
            statutAbonnement,
            statutFacturation,
            statutTechnique,
            montantImpaye,
            nombreFacturesImpayees,
            dateDernierPaiement: paiements.length > 0 ? paiements[paiements.length - 1].datePaiement : null,
            dateDerniereFacture: factures.length > 0 ? factures[factures.length - 1].dateEmission : null
        });
    }

    private calculerStatutContractuel(contrats: any[]): string {
        if (contrats.length === 0) return 'SANS_CONTRAT';
        
        const contratActif = contrats.find(c => c.statut === 'ACTIF');
        if (contratActif) return 'CONTRAT_ACTIF';
        
        const contratEnAttente = contrats.find(c => c.statut === 'EN_ATTENTE');
        if (contratEnAttente) return 'EN_ATTENTE_SIGNATURE';
        
        const contratSuspendu = contrats.find(c => c.statut === 'SUSPENDU');
        if (contratSuspendu) return 'CONTRAT_SUSPENDU';
        
        const contratResilie = contrats.find(c => c.statut === 'ANNULE');
        if (contratResilie) return 'CONTRAT_RESILIE';
        
        return 'CONTRAT_EXPIRE';
    }

    private calculerStatutPaiement(factures: any[], paiements: any[]): { statutPaiement: string, montantImpaye: number, nombreFacturesImpayees: number } {
        const maintenant = new Date();
        let montantImpaye = 0;
        let nombreFacturesImpayees = 0;
        
        factures.forEach(facture => {
            const paiementsFacture = paiements.filter(p => p.factureId === facture.id);
            const montantPaye = paiementsFacture.reduce((sum, p) => sum + parseFloat(p.montant), 0);
            const montantDu = parseFloat(facture.montantHT) - montantPaye;
            
            if (montantDu > 0) {
                montantImpaye += montantDu;
                nombreFacturesImpayees++;
            }
        });

        // Calculer le retard le plus important
        const facturesImpayees = factures.filter(f => {
            const paiementsFacture = paiements.filter(p => p.factureId === f.id);
            const montantPaye = paiementsFacture.reduce((sum, p) => sum + parseFloat(p.montant), 0);
            return parseFloat(f.montantHT) > montantPaye;
        });

        let statutPaiement = 'A_JOUR';
        if (montantImpaye > 0) {
            const retardMax = Math.max(...facturesImpayees.map(f => {
                const joursRetard = Math.floor((maintenant.getTime() - new Date(f.dateEcheance).getTime()) / (1000 * 60 * 60 * 24));
                return joursRetard;
            }));

            if (retardMax > 90) statutPaiement = 'IMPAYE';
            else if (retardMax > 60) statutPaiement = 'RETARD_IMPORTANT';
            else if (retardMax > 30) statutPaiement = 'RETARD_MODERE';
            else statutPaiement = 'RETARD_LEGER';
        }

        return { statutPaiement, montantImpaye, nombreFacturesImpayees };
    }

    private calculerStatutAbonnement(abonnements: any[]): string {
        if (abonnements.length === 0) return 'SANS_ABONNEMENT';
        
        const maintenant = new Date();
        const abonnementActif = abonnements.find(a => 
            a.dateDebut <= maintenant && (!a.dateFin || a.dateFin >= maintenant)
        );
        
        if (abonnementActif) return 'ABONNEMENT_ACTIF';
        
        const abonnementFutur = abonnements.find(a => a.dateDebut > maintenant);
        if (abonnementFutur) return 'EN_CREATION';
        
        return 'ABONNEMENT_EXPIRE';
    }

    private calculerStatutFacturation(factures: any[]): string {
        if (factures.length === 0) return 'FACTURATION_NORMALE';
        
        // Logique simplifiée - à adapter selon les besoins métier
        return 'FACTURATION_NORMALE';
    }

    private calculerStatutTechnique(abonnements: any[]): string {
        if (abonnements.length === 0) return 'OPERATIONNEL';
        
        // Logique simplifiée - à adapter selon les besoins métier
        return 'OPERATIONNEL';
    }
} 