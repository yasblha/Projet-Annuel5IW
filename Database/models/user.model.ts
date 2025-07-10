import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize): typeof Model => {
    class Utilisateur extends Model {
        static associate(models: any) {
            // Domain associations
            Utilisateur.hasMany(models.Adresse, { foreignKey: 'utilisateurId', as: 'adresses' });
            Utilisateur.hasMany(models.Contrat, { foreignKey: 'utilisateurId', as: 'contrats' });
            Utilisateur.hasMany(models.Abonnement, { foreignKey: 'utilisateurId', as: 'abonnements' });
            Utilisateur.hasMany(models.Intervention, { foreignKey: 'utilisateurId', as: 'interventions' });
            Utilisateur.hasMany(models.Facture, { foreignKey: 'clientId', as: 'factures' });
            Utilisateur.hasMany(models.JournalActivite, { foreignKey: 'utilisateurId', as: 'journalActivites' });
            // Auth associations
            Utilisateur.hasMany(models.PasswordResetToken, { foreignKey: 'userId', as: 'resetTokens' });
            Utilisateur.hasMany(models.RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
            Utilisateur.hasMany(models.LoginAttempt, { foreignKey: 'userId', as: 'loginAttempts' });
        }
    }

    Utilisateur.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4 },
        nom: {
            type: DataTypes.STRING,
            allowNull: false },
        prenom: {
            type: DataTypes.STRING,
            allowNull: false },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true } },
        hashMotDePasse: {
            type: DataTypes.STRING,
            allowNull: false },
        dateDerniereMAJMDP: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW },
        isLocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false },
        lockedUntil: {
            type: DataTypes.DATE,
            allowNull: true },
        tentativesEchecs: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0 },
        dernierEchec: {
            type: DataTypes.DATE,
            allowNull: true },
        tenantId: {
            type: DataTypes.STRING,
            allowNull: true },
        proprietaireEntrepriseId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'entreprises', key: 'id' }
        },

        telephone: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true },
        role: {
            type: DataTypes.ENUM('ADMIN','CLIENT','TECHNICIEN','COMMERCIAL','SUPPORT','COMPTABLE','MANAGER'),
            allowNull: false,
            defaultValue: 'CLIENT' },
        statut: {
            type: DataTypes.ENUM('EN_ATTENTE_VALIDATION','ACTIF','SUSPENDU','BLACKLISTE','ARCHIVE','SUPPRIME'),
            allowNull: false,
            defaultValue: 'EN_ATTENTE_VALIDATION' },
        dateDerniereConnexion: {
            type: DataTypes.DATE,
            allowNull: true },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW },
        resetToken: {
            type: DataTypes.STRING,
            allowNull: true },
        resetTokenExpiration: {
            type: DataTypes.DATE,
            allowNull: true },
        activationToken: {
            type: DataTypes.STRING,
            allowNull: true },
        activationTokenExpiration: {
            type: DataTypes.DATE,
            allowNull: true }
    }, {
        sequelize,
        modelName: 'Utilisateur',
        tableName: 'utilisateurs',
        timestamps: true,
        paranoid: true,
    });

    return Utilisateur;
};
