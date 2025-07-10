'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contrat_compteur_historiques', {
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
      compteurId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'compteurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      interventionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'interventions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      typeAction: {
        type: Sequelize.ENUM('ASSOCIATION', 'DISSOCIATION', 'REMPLACEMENT'),
        allowNull: false
      },
      dateDebut: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      dateFin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      motif: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      commentaire: {
        type: Sequelize.TEXT,
        allowNull: true
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
      },
      dateCreation: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      dateMaj: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Index pour les performances
    await queryInterface.addIndex('contrat_compteur_historiques', ['contratId']);
    await queryInterface.addIndex('contrat_compteur_historiques', ['compteurId']);
    await queryInterface.addIndex('contrat_compteur_historiques', ['interventionId']);
    await queryInterface.addIndex('contrat_compteur_historiques', ['typeAction']);
    await queryInterface.addIndex('contrat_compteur_historiques', ['dateDebut']);
    await queryInterface.addIndex('contrat_compteur_historiques', ['tenantId']);
    await queryInterface.addIndex('contrat_compteur_historiques', ['contratId', 'dateFin'], {
      where: { dateFin: null },
      name: 'idx_contrat_compteur_actif'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contrat_compteur_historiques');
  }
}; 