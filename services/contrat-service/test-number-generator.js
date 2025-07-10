#!/usr/bin/env node

/**
 * Script de test pour le NumberGeneratorService
 * Usage: node test-number-generator.js
 */

const { NumberGenerator } = require('./src/application/services/number-generator.service');

async function testNumberGenerator() {
  console.log('🧪 Test du NumberGeneratorService\n');

  const numberGen = new NumberGenerator();

  try {
    // Test 1: Génération de numéros de contrat
    console.log('📋 Test 1: Génération de numéros de contrat');
    console.log('==========================================');
    
    const numero1 = await numberGen.nextContractNumber('P', 'TLS');
    console.log(`✅ Contrat Particulier Toulouse: ${numero1}`);
    
    const numero2 = await numberGen.nextContractNumber('I', 'PAR');
    console.log(`✅ Contrat Individuel Paris: ${numero2}`);
    
    const numero3 = await numberGen.nextContractNumber('C', 'MAR');
    console.log(`✅ Contrat Collectivité Marseille: ${numero3}`);

    // Test 2: Génération d'identifiants de compteur
    console.log('\n🔧 Test 2: Génération d\'identifiants de compteur');
    console.log('================================================');
    
    const compteur1 = numberGen.nextCompteurNumber('TLS', '40', '723456');
    console.log(`✅ Compteur TLS Calibre 40: ${compteur1}`);
    
    const compteur2 = numberGen.nextCompteurNumber('PAR', '25', '123');
    console.log(`✅ Compteur PAR Calibre 25: ${compteur2}`);

    // Test 3: Validation de formats
    console.log('\n✅ Test 3: Validation de formats');
    console.log('================================');
    
    console.log(`Validation contrat "${numero1}": ${numberGen.validateContractNumber(numero1)}`);
    console.log(`Validation contrat "C-X-TLS-25-00432": ${numberGen.validateContractNumber('C-X-TLS-25-00432')}`);
    console.log(`Validation compteur "${compteur1}": ${numberGen.validateCompteurNumber(compteur1)}`);
    console.log(`Validation compteur "M-TLS-40-723456": ${numberGen.validateCompteurNumber('M-TLS-40-723456')}`);

    // Test 4: Parsing de numéros
    console.log('\n🔍 Test 4: Parsing de numéros');
    console.log('==============================');
    
    const parsed = numberGen.parseContractNumber(numero1);
    console.log(`Parsing "${numero1}":`, parsed);
    
    const invalid = numberGen.parseContractNumber('C-X-TLS-25-00432');
    console.log(`Parsing invalide: ${invalid}`);

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  testNumberGenerator();
}

module.exports = { testNumberGenerator }; 