'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contract_counters', 'type_code', {
      type: Sequelize.CHAR(1),
      allowNull: false,
      defaultValue: 'P', // Par défaut 'P' pour Particulier
      after: 'zone_code'
    });

    // Mettre à jour la clé primaire pour inclure type_code
    await queryInterface.removeConstraint('contract_counters', 'contract_counters_pkey');
    await queryInterface.addConstraint('contract_counters', {
      fields: ['type_code', 'zone_code', 'year_short'],
      type: 'primary key',
      name: 'contract_counters_pkey'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Restaurer l'ancienne clé primaire
    await queryInterface.removeConstraint('contract_counters', 'contract_counters_pkey');
    await queryInterface.addConstraint('contract_counters', {
      fields: ['zone_code', 'year_short'],
      type: 'primary key',
      name: 'contract_counters_pkey'
    });

    await queryInterface.removeColumn('contract_counters', 'type_code');
  }
}; 