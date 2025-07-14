/**
 * Service pour la gestion des templates de contrat et la génération de PDF
 */
import apiClient from '@/services/http.interceptor';
import { saveAs } from 'file-saver'; 
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { Contract } from '@/types/contract.types';

// Configuration des polices pour pdfmake
(pdfMake as any).vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;

/**
 * Liste des variables disponibles dans les templates de contrat
 */
export const CONTRACT_TEMPLATE_VARIABLES = {
  // Informations du contrat
  'contrat.numero': 'Numéro du contrat',
  'contrat.dateDebut': 'Date de début du contrat',
  'contrat.dateFin': 'Date de fin du contrat',
  'contrat.type': 'Type de contrat',
  'contrat.statut': 'Statut du contrat',
  'contrat.montantTotal': 'Montant total du contrat',
  
  // Informations client/propriétaire
  'proprietaire.nom': 'Nom du propriétaire',
  'proprietaire.prenom': 'Prénom du propriétaire',
  'proprietaire.adresse': 'Adresse du propriétaire',
  'proprietaire.email': 'Email du propriétaire',
  'proprietaire.telephone': 'Téléphone du propriétaire',
  'proprietaire.type': 'Type de propriétaire (particulier, entreprise)',
  
  // Informations du compteur
  'compteur.numero': 'Numéro du compteur',
  'compteur.type': 'Type de compteur',
  'compteur.adresse': 'Adresse d\'installation',
  
  // Informations de facturation
  'facturation.montantMensuel': 'Montant mensuel',
  'facturation.modePaiement': 'Mode de paiement',
};

// Template par défaut du contrat
const DEFAULT_CONTRACT_TEMPLATE = `
# CONTRAT DE FOURNITURE D'ÉNERGIE

## Numéro de contrat: {{contrat.numero}}

### ENTRE LES SOUSSIGNÉS:

**LA SOCIÉTÉ FOURNISSEUR D'ÉNERGIE**, 
Société par Actions Simplifiée au capital de 100 000 €,
Immatriculée au RCS de Paris sous le numéro 123 456 789,
Dont le siège social est situé au 1 rue de l'Énergie, 75001 Paris,
Représentée par son Directeur Général en exercice,

Ci-après dénommée "LE FOURNISSEUR",
D'une part,

ET

**{{proprietaire.type === 'ENTREPRISE' ? 'La société ' + proprietaire.nom : proprietaire.prenom + ' ' + proprietaire.nom}}**
{{proprietaire.type === 'ENTREPRISE' ? 'Immatriculée au RCS sous le numéro ' + proprietaire.siret : 'Né(e) le ' + proprietaire.dateNaissance}}
Demeurant au {{proprietaire.adresse}}
Email : {{proprietaire.email}}
Téléphone : {{proprietaire.telephone}}

Ci-après dénommé(e) "LE CLIENT",
D'autre part,

### IL A ÉTÉ CONVENU CE QUI SUIT:

**Article 1 - Objet du contrat**

Le présent contrat a pour objet de définir les conditions de fourniture d'énergie par LE FOURNISSEUR au point de livraison du CLIENT.

**Article 2 - Caractéristiques de la fourniture**

- Type de compteur: {{compteur.type}}
- Numéro de compteur: {{compteur.numero}}
- Adresse du point de livraison: {{compteur.adresse}}
- Date de début de fourniture: {{contrat.dateDebut}}
- Date de fin de contrat: {{contrat.dateFin}}

**Article 3 - Conditions tarifaires**

Le CLIENT s'engage à payer mensuellement la somme de {{facturation.montantMensuel}} € par prélèvement automatique.

**Article 4 - Durée du contrat**

Le présent contrat est conclu pour une durée déterminée, du {{contrat.dateDebut}} au {{contrat.dateFin}}.

**Article 5 - Résiliation**

Le CLIENT peut résilier le présent contrat à tout moment, moyennant un préavis de 30 jours.

**Fait à Paris, le {{contrat.dateCreation}}**

Signature du FOURNISSEUR:                  Signature du CLIENT:

_________________________                _________________________
`;

/**
 * Parse un template et remplace les variables par les valeurs correspondantes
 */
function parseTemplate(template: string, data: any): string {
  return template.replace(/\{\{([\w.]+)\}\}/g, (match, variable) => {
    // Diviser la variable par les points pour accéder aux propriétés imbriquées
    const keys = variable.split('.');
    let value = data;
    
    // Parcourir les clés pour obtenir la valeur
    for (const key of keys) {
      if (value === undefined || value === null) return match;
      value = value[key];
    }
    
    // Si la valeur est une date, la formater
    if (value instanceof Date) {
      return value.toLocaleDateString('fr-FR');
    }
    
    // Retourner la valeur ou le match original si la valeur est undefined
    return value !== undefined ? value : match;
  });
}

/**
 * Convertit un texte markdown simple en définition pdfmake
 */
function markdownToPdfMake(markdown: string) {
  const lines = markdown.split('\n');
  const docDefinition: any = {
    content: [],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      subsubheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      paragraph: {
        fontSize: 12,
        margin: [0, 5, 0, 10]
      },
      bold: {
        bold: true
      }
    },
    defaultStyle: {
      fontSize: 12
    }
  };

  let currentList: any[] = [];
  let inList = false;

  for (let line of lines) {
    line = line.trim();
    
    // Titre principal
    if (line.startsWith('# ')) {
      docDefinition.content.push({
        text: line.substring(2),
        style: 'header'
      });
    }
    // Sous-titre
    else if (line.startsWith('## ')) {
      docDefinition.content.push({
        text: line.substring(3),
        style: 'subheader'
      });
    }
    // Sous-sous-titre
    else if (line.startsWith('### ')) {
      docDefinition.content.push({
        text: line.substring(4),
        style: 'subsubheader'
      });
    }
    // Élément de liste
    else if (line.startsWith('- ')) {
      if (!inList) {
        currentList = [];
        inList = true;
      }
      currentList.push(line.substring(2));
    }
    // Texte en gras
    else if (line.startsWith('**') && line.endsWith('**')) {
      docDefinition.content.push({
        text: line.substring(2, line.length - 2),
        style: 'bold'
      });
    }
    // Paragraphe normal
    else if (line !== '') {
      // Si nous étions dans une liste, l'ajouter au document
      if (inList) {
        docDefinition.content.push({
          ul: currentList
        });
        currentList = [];
        inList = false;
      }
      
      // Traiter le gras à l'intérieur du texte
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const textParts = parts.map(part => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return { text: part.substring(2, part.length - 2), bold: true };
          }
          return { text: part };
        });
        docDefinition.content.push({ text: textParts });
      } else {
        docDefinition.content.push({
          text: line,
          style: 'paragraph'
        });
      }
    }
  }
  
  // Ne pas oublier d'ajouter la dernière liste si elle existe
  if (inList && currentList.length > 0) {
    docDefinition.content.push({
      ul: currentList
    });
  }
  
  return docDefinition;
}

/**
 * Service pour la gestion des templates de contrat
 */
export const contractTemplateService = {
  /**
   * Récupère un template par défaut
   */
  getDefaultTemplate() {
    return DEFAULT_CONTRACT_TEMPLATE;
  },
  
  /**
   * Récupère un template spécifique (futur appel API)
   */
  async getTemplate(templateId = 'default') {
    if (templateId === 'default') {
      return { content: DEFAULT_CONTRACT_TEMPLATE };
    }
    
    // Pour le moment, toujours retourner le template par défaut
    // À remplacer par un appel API quand le backend sera prêt
    return { content: DEFAULT_CONTRACT_TEMPLATE };
  },
  
  /**
   * Génère un PDF à partir d'un template et des données du contrat
   */
  async generatePDF(contract: Contract, templateId = 'default') {
    try {
      // 1. Récupérer le template
      const template = await this.getTemplate(templateId);
      
      // 2. Préparer les données complètes du contrat
      const contractData = await this.prepareContractData(contract);
      
      // 3. Remplacer les variables dans le template
      const parsedContent = parseTemplate(template.content, contractData);
      
      // 4. Convertir le markdown en définition pdfmake
      const docDefinition = markdownToPdfMake(parsedContent);
      
      // 5. Générer le PDF
      return new Promise<Blob>((resolve, reject) => {
        pdfMake.createPdf(docDefinition).getBlob((blob) => {
          resolve(blob);
        });
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  },
  
  /**
   * Télécharge le PDF d'un contrat
   */
  async downloadContractPDF(contract: Contract, templateId = 'default') {
    try {
      const blob = await this.generatePDF(contract, templateId);
      
      // Créer un nom de fichier approprié
      const fileName = `Contrat_${contract.numero || contract.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Utiliser FileSaver pour déclencher le téléchargement
      saveAs(blob, fileName);
      
      return true;
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw error;
    }
  },
  
  /**
   * Prévisualise le template avec les variables remplacées
   */
  async previewTemplate(contract: Contract, templateId = 'default') {
    const template = await this.getTemplate(templateId);
    const contractData = await this.prepareContractData(contract);
    return parseTemplate(template.content, contractData);
  },
  
  /**
   * Prépare les données complètes du contrat pour le template
   * Incluant les données des entités liées (propriétaire, compteur, etc.)
   */
  async prepareContractData(contract: Contract) {
    // Structure de base
    const data: any = {
      contrat: {
        ...contract,
        dateCreation: new Date(contract.dateCreation).toLocaleDateString('fr-FR'),
        dateDebut: new Date(contract.dateDebut).toLocaleDateString('fr-FR'),
        dateFin: contract.dateFin ? new Date(contract.dateFin).toLocaleDateString('fr-FR') : 'N/A'
      },
      proprietaire: {
        nom: 'Nom par défaut',
        prenom: 'Prénom par défaut',
        adresse: 'Adresse par défaut',
        email: 'email@exemple.com',
        telephone: '01 23 45 67 89',
        type: 'PARTICULIER'
      },
      compteur: {
        numero: 'N/A',
        type: 'N/A',
        adresse: 'N/A'
      },
      facturation: {
        montantMensuel: 'N/A',
        modePaiement: 'Prélèvement automatique'
      }
    };
    
    // Si nous avons l'ID du propriétaire, essayons de récupérer ses informations
    if (contract.proprietaireId) {
      try {
        // Dans une implémentation réelle, nous ferions un appel API ici
        // Pour le moment, utilisons des données fictives
        data.proprietaire = {
          nom: contract.proprietaireNom || 'Doe',
          prenom: contract.proprietairePrenom || 'John',
          adresse: '123 rue de la République, 75011 Paris',
          email: contract.proprietaireEmail || 'john.doe@example.com',
          telephone: '01 23 45 67 89',
          type: contract.typeProprietaire || 'PARTICULIER',
          siret: '123 456 789 00012',
          dateNaissance: '01/01/1980'
        };
      } catch (error) {
        console.warn('Erreur lors de la récupération des informations du propriétaire:', error);
      }
    }
    
    // Si nous avons l'ID du compteur, essayons de récupérer ses informations
    if (contract.compteurId) {
      try {
        // Dans une implémentation réelle, nous ferions un appel API ici
        // Pour le moment, utilisons des données fictives
        data.compteur = {
          numero: contract.compteurId,
          type: 'Électrique',
          adresse: contract.adresseLivraison || '123 rue de la République, 75011 Paris'
        };
      } catch (error) {
        console.warn('Erreur lors de la récupération des informations du compteur:', error);
      }
    }
    
    // Informations de facturation (fictives pour le moment)
    data.facturation = {
      montantMensuel: contract.montant || '50',
      modePaiement: 'Prélèvement automatique'
    };
    
    return data;
  }
};
