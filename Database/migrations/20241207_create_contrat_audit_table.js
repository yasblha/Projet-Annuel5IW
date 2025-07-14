'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contrat_audits', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      contratId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'contrats',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'utilisateurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.ENUM(
          'CREATION', 'MODIFICATION', 'SIGNATURE', 'RESILIATION', 'SUSPENSION', 
          'RENOUVELLEMENT', 'ASSOCIATION_COMPTEUR', 'DISSOCIATION_COMPTEUR',
          'ASSOCIATION_ABONNEMENT', 'DISSOCIATION_ABONNEMENT', 'ASSOCIATION_CLIENT',
          'DISSOCIATION_CLIENT', 'AJOUT_COSIGNATAIRE', 'SUPPRESSION_COSIGNATAIRE',
          'SIGNATURE_COSIGNATAIRE', 'INTERVENTION_CREEE', 'INTERVENTION_TERMINEE'
        ),
        allowNull: false
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true
      },
      commentaire: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dateAction: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      tenantId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: true
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true
      }
    });

    // Index pour les performances
    await queryInterface.addIndex('contrat_audits', ['contratId']);
    await queryInterface.addIndex('contrat_audits', ['userId']);
    await queryInterface.addIndex('contrat_audits', ['action']);
    await queryInterface.addIndex('contrat_audits', ['dateAction']);
    await queryInterface.addIndex('contrat_audits', ['tenantId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contrat_audits');
  }
}; 