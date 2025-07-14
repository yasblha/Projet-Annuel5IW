import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { formatDate } from '../utils/format-utils';

@Injectable()
export class FactureEvents {
  private readonly mailerClient: ClientProxy;
  private readonly logger = new Logger(FactureEvents.name);

  constructor() {
    // Création d'un client RabbitMQ pour envoyer des événements au mailer
    this.mailerClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'mailer_queue',
        queueOptions: {
          durable: true
        }
      }
    });
  }

  /**
   * Gestionnaire d'événement pour l'émission d'une facture
   * @param data Les données de la facture émise
   */
  @EventPattern('facture.emise')
  async handleFactureEmise(data: any) {
    this.logger.log(`📬 Réception événement facture.emise: ${JSON.stringify(data)}`);
    
    try {
      const { facture, client } = data;
      
      if (!client || !client.email) {
        this.logger.warn('Email client manquant, impossible d\'envoyer la notification');
        return;
      }
      
      // Conversion des dates en format lisible
      const dateEmission = formatDate(facture.dateEmission);
      const dateEcheance = formatDate(facture.dateEcheance);
      
      // Préparation des données pour le template
      const templateData = {
        client: {
          nom: client.nom || 'Client',
          prenom: client.prenom || '',
          email: client.email
        },
        facture: {
          numero: facture.numero,
          montantTTC: facture.montantTTC.toFixed(2),
          dateEmission: dateEmission,
          dateEcheance: dateEcheance,
          lien: `${process.env.FRONTEND_URL}/factures/${facture.id}`,
          lignes: facture.lignes || []
        },
        paiementUrl: `${process.env.FRONTEND_URL}/factures/${facture.id}/paiement`
      };
      
      // Émettre un événement pour l'envoi d'email au lieu d'appeler directement le service
      this.mailerClient.emit('email.send', {
        to: client.email,
        subject: `Nouvelle facture N°${facture.numero}`,
        template: 'facture-emission',
        context: templateData
      });
      
      this.logger.log(`✅ Événement d'email envoyé pour la facture ${facture.numero} à ${client.email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur lors du traitement de facture.emise: ${error.message}`, error.stack);
    }
  }
  
  /**
   * Gestionnaire d'événement pour le paiement d'une facture
   * @param data Les données du paiement
   */
  @EventPattern('facture.payee')
  async handleFacturePayee(data: any) {
    this.logger.log(`📬 Réception événement facture.payee: ${JSON.stringify(data)}`);
    
    try {
      const { facture, paiement, client } = data;
      
      if (!client || !client.email) {
        this.logger.warn('Email client manquant, impossible d\'envoyer la notification');
        return;
      }
      
      // Conversion des dates en format lisible
      const datePaiement = formatDate(paiement.date);
      const dateEmission = formatDate(facture.dateEmission);
      
      // Préparation des données pour le template
      const templateData = {
        client: {
          nom: client.nom || 'Client',
          prenom: client.prenom || '',
          email: client.email
        },
        facture: {
          numero: facture.numero,
          montantTTC: facture.montantTTC.toFixed(2),
          dateEmission: dateEmission,
          lien: `${process.env.FRONTEND_URL}/factures/${facture.id}`
        },
        paiement: {
          montant: paiement.montant.toFixed(2),
          date: datePaiement,
          methode: paiement.methode || 'Carte bancaire',
          reference: paiement.reference || '-'
        }
      };
      
      // Émettre un événement pour l'envoi d'email au lieu d'appeler directement le service
      this.mailerClient.emit('email.send', {
        to: client.email,
        subject: `Confirmation de paiement - Facture N°${facture.numero}`,
        template: 'facture-paiement',
        context: templateData
      });
      
      this.logger.log(`✅ Événement d'email envoyé pour le paiement de la facture ${facture.numero} à ${client.email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur lors du traitement de facture.payee: ${error.message}`, error.stack);
    }
  }
  
  /**
   * Gestionnaire d'événement pour la relance d'une facture impayée
   * @param data Les données de la relance
   */
  @EventPattern('facture.relance')
  async handleFactureRelance(data: any) {
    this.logger.log(`📬 Réception événement facture.relance: ${JSON.stringify(data)}`);
    
    try {
      const { facture, client, relanceNumber } = data;
      
      if (!client || !client.email) {
        this.logger.warn('Email client manquant, impossible d\'envoyer la notification');
        return;
      }
      
      // Conversion des dates en format lisible
      const dateEmission = formatDate(facture.dateEmission);
      const dateEcheance = formatDate(facture.dateEcheance);
      const joursRetard = Math.floor((new Date().getTime() - new Date(facture.dateEcheance).getTime()) / (1000 * 60 * 60 * 24));
      
      // Textes spécifiques selon le niveau de relance
      const subjects = {
        1: `Rappel - Facture N°${facture.numero} en attente de paiement`,
        2: `IMPORTANT: Facture N°${facture.numero} en retard de paiement`,
        3: `URGENT: Dernier rappel avant procédure - Facture N°${facture.numero}`
      };
      
      // Préparation des données pour le template
      const templateData = {
        client: {
          nom: client.nom || 'Client',
          prenom: client.prenom || '',
          email: client.email
        },
        facture: {
          numero: facture.numero,
          montantTTC: facture.montantTTC.toFixed(2),
          dateEmission: dateEmission,
          dateEcheance: dateEcheance,
          joursRetard: joursRetard,
          lien: `${process.env.FRONTEND_URL}/factures/${facture.id}`
        },
        relance: {
          niveau: relanceNumber || 1,
          message: relanceNumber >= 3 ? 
            'Ceci est notre dernier rappel avant l\'engagement d\'une procédure de recouvrement.' :
            'Nous vous remercions de procéder au règlement dans les plus brefs délais.'
        },
        paiementUrl: `${process.env.FRONTEND_URL}/factures/${facture.id}/paiement`
      };
      
      // Émettre un événement pour l'envoi d'email au lieu d'appeler directement le service
      this.mailerClient.emit('email.send', {
        to: client.email,
        subject: subjects[relanceNumber] || `Rappel - Facture impayée N°${facture.numero}`,
        template: 'facture-relance',
        context: templateData
      });
      
      this.logger.log(`✅ Événement d'email de relance niveau ${relanceNumber} envoyé pour la facture ${facture.numero} à ${client.email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur lors du traitement de facture.relance: ${error.message}`, error.stack);
    }
  }
}
