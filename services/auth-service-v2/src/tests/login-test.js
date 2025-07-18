const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login to Auth Service V2 via API Gateway...');
    
    const credentials = {
      email: 'admin@example.com',
      password: 'Password123456!'  // Utilisation du mot de passe plus long et sécurisé
    };
    
    console.log('Sending login request with credentials:', credentials);
    
    const response = await axios.post('http://localhost:3000/auth/v2/login', credentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000 // Augmenter le timeout à 15 secondes pour le test
    });
    
    console.log('Login successful!');
    console.log('Status code:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Login failed!');
    
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état
      // qui n'est pas dans la plage 2xx
      console.error('Status code:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('No response received from server');
      console.error('Request details:', error.request._currentUrl);
      console.error('Timeout:', error.request.timeout);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
}

// Exécuter le test
testLogin()
  .then((userData) => {
    console.log('Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed with error:', error.message);
    process.exit(1);
  });
