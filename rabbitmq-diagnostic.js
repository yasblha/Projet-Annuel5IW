const amqp = require('amqplib');

async function testRabbitMQCommunication() {
  try {
    console.log('Connexion à RabbitMQ...');
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    console.log('Connexion établie avec succès');

    const channel = await connection.createChannel();
    console.log('Canal créé avec succès');

    const queue = 'contract_queue_v2';
    await channel.assertQueue(queue, { durable: true });
    console.log(`Queue '${queue}' vérifiée/créée avec succès`);

    // Envoi d'un message de test
    const testMessage = {
      pattern: 'ping',
      data: { token: null, test: 'diagnostic' }
    };
    
    console.log(`Envoi du message: ${JSON.stringify(testMessage)}`);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(testMessage)), {
      contentType: 'application/json',
      contentEncoding: 'utf-8'
    });
    console.log('Message envoyé avec succès');

    // Attendre un peu avant de fermer la connexion
    setTimeout(async () => {
      await channel.close();
      await connection.close();
      console.log('Connexion fermée');
    }, 1000);
  } catch (error) {
    console.error('Erreur lors du test RabbitMQ:', error);
  }
}

testRabbitMQCommunication();
