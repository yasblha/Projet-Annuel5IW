"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("@Database/sequelize");
class UserRepository {
    constructor() {
        this.repo = sequelize_2.models.Utilisateur;
    }
    async create(data) {
        return this.repo.create(data);
    }
    async findById(id) {
        const user = await this.repo.findByPk(id);
        if (!user)
            throw new Error(`Utilisateur non trouvé (id=${id})`);
        return user;
    }
    async findByEmail(email) {
        return this.repo.findOne({ where: { email: { [sequelize_1.Op.iLike]: email } } });
    }
    async findByPhone(telephone) {
        return this.repo.findOne({ where: { telephone } });
    }
    async findByPersonalInfo(personalInfo) {
        return this.repo.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { nom: { [sequelize_1.Op.iLike]: personalInfo } },
                    { prenom: { [sequelize_1.Op.iLike]: personalInfo } },
                    { email: { [sequelize_1.Op.iLike]: personalInfo } },
                    { telephone: { [sequelize_1.Op.iLike]: personalInfo } },
                ],
            },
        });
    }
    async updatePassword({ userId, newHash }) {
        const [count] = await this.repo.update({
            hashMotDePasse: newHash,
            dateDerniereMAJMDP: new Date(),
            tentativesEchecs: 0,
            isLocked: false,
            lockedUntil: null,
        }, { where: { id: userId } });
        if (count === 0)
            throw new Error(`Utilisateur non trouvé pour mise à jour du mot de passe (id=${userId})`);
    }
    async activateUser(userId, newHash) {
        const [count] = await this.repo.update({
            hashMotDePasse: newHash,
            statut: 'ACTIF',
            dateDerniereMAJMDP: new Date(),
        }, { where: { id: userId } });
        if (count === 0)
            throw new Error(`Utilisateur non trouvé pour activation (id=${userId})`);
    }
    async registerFailedLogin(userId, maxAttempts = 5, lockDurationMs = 30 * 60 * 1000) {
        const user = await this.findById(userId);
        const now = new Date();
        if (user.dernierEchec && now.getTime() - user.dernierEchec.getTime() > 15 * 60 * 1000) {
            user.tentativesEchecs = 1;
        }
        else {
            user.tentativesEchecs++;
        }
        user.dernierEchec = now;
        if (user.tentativesEchecs >= maxAttempts) {
            user.isLocked = true;
            user.lockedUntil = new Date(now.getTime() + lockDurationMs);
        }
        await user.save();
    }
    async resetFailedLogins(userId) {
        await this.repo.update({ tentativesEchecs: 0, dernierEchec: null, isLocked: false, lockedUntil: null }, { where: { id: userId } });
    }
    async isLocked(userId) {
        const user = await this.findById(userId);
        if (!user.isLocked)
            return false;
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            return true;
        }
        await this.resetFailedLogins(userId);
        return false;
    }
    async touchLastLogin(userId) {
        await this.repo.update({ dateDerniereConnexion: new Date() }, { where: { id: userId } });
    }
    async updateProfile({ userId, updates }) {
        const [count] = await this.repo.update(updates, { where: { id: userId } });
        if (count === 0)
            throw new Error(`Utilisateur non trouvé pour mise à jour (id=${userId})`);
    }
    async updateStatus({ userId, statut }) {
        const [count] = await this.repo.update({ statut }, { where: { id: userId } });
        if (count === 0)
            throw new Error(`Utilisateur non trouvé pour changement de statut (id=${userId})`);
    }
    async remove(userId) {
        const user = await this.findById(userId);
        await user.destroy();
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map