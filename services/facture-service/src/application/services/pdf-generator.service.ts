import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from './audit.service';

@Injectable()
export class PdfGeneratorService {
  private readonly fonts = {
    Roboto: {
      normal: 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
      bold: 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
      italic: 'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
      bolditalic: 'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf',
    },
  };

  private readonly printer: any;
  private readonly tempDir: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {
    this.printer = new PdfPrinter(this.fonts);
    // Utiliser un répertoire temporaire configuré ou par défaut
    this.tempDir = this.configService.get<string>('PDF_TEMP_DIR') || path.join(process.cwd(), 'temp');
    
    // S'assurer que le répertoire temporaire existe
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Génère un document PDF de facture
   * @param facture Les données de la facture
   * @param context Le contexte de la requête (tenant, utilisateur, etc.)
   * @returns Le chemin vers le fichier PDF généré
   */
  async generateFacturePdf(facture: any, context: any): Promise<string> {
    try {
      const docDefinition = this.createFactureDocumentDefinition(facture);
      const uniqueFileName = `facture_${facture.numero || facture.id}_${uuidv4()}.pdf`;
      const outputPath = path.join(this.tempDir, uniqueFileName);
      
      return new Promise((resolve, reject) => {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        
        // Diriger le flux vers le fichier
        const writeStream = fs.createWriteStream(outputPath);
        pdfDoc.pipe(writeStream);
        
        writeStream.on('finish', () => {
          this.auditService.logAction({
            action: 'PDF_FACTURE_GENERE',
            factureId: facture.id,
            details: { filePath: outputPath },
            tenantId: context.tenantId,
            userId: context.userId,
          });
          resolve(outputPath);
        });
        
        writeStream.on('error', (error) => {
          reject(new Error(`Erreur lors de la génération du PDF : ${error.message}`));
        });
        
        pdfDoc.end();
      });
    } catch (error) {
      throw new Error(`Erreur lors de la génération du PDF de la facture : ${error.message}`);
    }
  }

  /**
   * Crée la définition du document pour PDFMake
   * @param facture Les données de la facture
   * @returns La définition du document
   */
  private createFactureDocumentDefinition(facture: any): TDocumentDefinitions {
    // Calculer le total des paiements
    const totalPaiements = facture.paiements?.reduce((sum, paiement) => sum + paiement.montant, 0) || 0;
    const resteAPayer = Math.max(0, facture.montantTTC - totalPaiements);

    // Formater les montants pour l'affichage
    const formatMontant = (montant: number) => {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
    };

    // Formater les dates pour l'affichage
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR').format(date);
    };

    // Créer les lignes de facturation pour le tableau
    const lignesFacture = facture.lignes?.map((ligne, index) => {
      return [
        { text: (index + 1).toString(), alignment: 'center' },
        { text: ligne.description },
        { text: ligne.quantite.toString(), alignment: 'center' },
        { text: formatMontant(ligne.prixUnitaire), alignment: 'right' },
        { text: formatMontant(ligne.montantHT), alignment: 'right' },
      ];
    }) || [];

    // En-tête du tableau
    const tableHeader: TableCell[] = [
      { text: '#', style: 'tableHeader', alignment: 'center' },
      { text: 'Description', style: 'tableHeader' },
      { text: 'Quantité', style: 'tableHeader', alignment: 'center' },
      { text: 'Prix unitaire', style: 'tableHeader', alignment: 'right' },
      { text: 'Montant HT', style: 'tableHeader', alignment: 'right' },
    ];

    // Définir le document PDF
    return {
      content: [
        // En-tête de la facture
        {
          columns: [
            {
              // Logo et information de l'entreprise
              width: '50%',
              text: [
                { text: 'ENTREPRISE XYZ\n', style: 'header' },
                '123 Rue du Commerce\n',
                '75001 Paris, France\n',
                'Tél: +33 1 23 45 67 89\n',
                'Email: contact@entreprise-xyz.com\n',
                'SIRET: 123 456 789 00012',
              ],
            },
            {
              // Information de la facture
              width: '50%',
              text: [
                { text: 'FACTURE\n', style: 'header', alignment: 'right' },
                { text: `N° ${facture.numero || facture.id}\n`, alignment: 'right' },
                { text: `Date: ${formatDate(facture.dateEmission)}\n`, alignment: 'right' },
                { text: `Échéance: ${formatDate(facture.dateEcheance)}\n`, alignment: 'right' },
                { text: `Contrat: ${facture.contratId}\n`, alignment: 'right' },
              ],
              alignment: 'right',
            },
          ],
        },

        // Informations client
        {
          style: 'subheader',
          margin: [0, 20, 0, 10],
          text: 'Informations client',
        },
        {
          text: [
            `Client: ${facture.client?.nom || 'Non spécifié'}\n`,
            `Adresse: ${facture.adresseFacturation || 'Non spécifiée'}\n`,
            facture.client?.email ? `Email: ${facture.client.email}\n` : '',
          ],
        },

        // Détails de la facture
        {
          style: 'subheader',
          margin: [0, 20, 0, 10],
          text: 'Détails de la facture',
        },
        {
          text: facture.description,
          margin: [0, 0, 0, 10],
        },
        {
          text: [
            facture.periodeDebut && facture.periodeFin ? 
              `Période de facturation: du ${formatDate(facture.periodeDebut)} au ${formatDate(facture.periodeFin)}\n` : '',
          ],
          margin: [0, 0, 0, 10],
        },
        
        // Tableau des lignes de facturation
        {
          table: {
            headerRows: 1,
            widths: ['5%', '50%', '15%', '15%', '15%'],
            body: [
              tableHeader,
              ...lignesFacture
            ],
          },
          layout: {
            hLineWidth: function(i, node) {
              return (i === 0 || i === node.table.body.length) ? 2 : 1;
            },
            vLineWidth: function(i, node) {
              return (i === 0 || i === node.table.widths.length) ? 2 : 1;
            },
            hLineColor: function(i, node) {
              return (i === 0 || i === node.table.body.length) ? '#333' : '#ddd';
            },
            vLineColor: function(i, node) {
              return (i === 0 || i === node.table.widths.length) ? '#333' : '#ddd';
            },
          },
        },

        // Récapitulatif des montants
        {
          margin: [0, 20, 0, 0],
          columns: [
            { width: '60%', text: '' },
            {
              width: '40%',
              table: {
                widths: ['50%', '50%'],
                body: [
                  [
                    { text: 'Montant HT', style: 'tableHeader', alignment: 'left' },
                    { text: formatMontant(facture.montantHT), alignment: 'right' },
                  ],
                  [
                    { text: 'TVA', style: 'tableHeader', alignment: 'left' },
                    { text: formatMontant(facture.montantTVA), alignment: 'right' },
                  ],
                  [
                    { text: 'Total TTC', style: 'tableHeader', alignment: 'left' },
                    { text: formatMontant(facture.montantTTC), alignment: 'right' },
                  ],
                  [
                    { text: 'Déjà payé', style: 'tableHeader', alignment: 'left' },
                    { text: formatMontant(totalPaiements), alignment: 'right' },
                  ],
                  [
                    { text: 'Reste à payer', style: 'tableHeader', alignment: 'left' },
                    { text: formatMontant(resteAPayer), alignment: 'right', style: 'strong' },
                  ],
                ],
              },
              layout: 'lightHorizontalLines',
            },
          ],
        },

        // Informations de paiement
        {
          text: 'Modalités de paiement',
          style: 'subheader',
          margin: [0, 30, 0, 10],
        },
        {
          text: [
            'Veuillez effectuer votre paiement sur le compte bancaire suivant:\n\n',
            'Banque: Banque XYZ\n',
            'IBAN: FR76 1234 5678 9012 3456 7890 123\n',
            'BIC: ABCDEFGHIJK\n\n',
            'Référence à mentionner: Facture ' + (facture.numero || facture.id),
          ],
        },

        // Notes et conditions
        {
          text: 'Notes et conditions',
          style: 'subheader',
          margin: [0, 30, 0, 10],
        },
        {
          text: [
            'Tout paiement au-delà de la date d\'échéance pourra faire l\'objet de pénalités de retard.\n',
            'Les réclamations concernant cette facture doivent être effectuées dans un délai de 15 jours suivant sa réception.',
          ],
        },
      ],
      footer: {
        columns: [
          {
            text: 'Facture générée automatiquement - Document valable sans signature',
            alignment: 'center',
            style: 'footer',
          }
        ],
        margin: [40, 0]
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#333',
        },
        strong: {
          bold: true,
        },
        footer: {
          fontSize: 10,
          italics: true,
          color: '#777',
        },
      },
      defaultStyle: {
        fontSize: 11,
      },
    };
  }
}
