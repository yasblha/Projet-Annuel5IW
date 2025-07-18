const axios = require('axios');

async function testRegister() {
  try {
    console.log('Testing registration to Auth Service V2 via API Gateway...');
    
    const userData = {
      email: 'admin@example.com',
      password: 'Password123456!',  // Mot de passe plus long et plus sécurisé
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      agencyName: 'Test Agency'  // Ajout du nom de l'agence
    };
    
    console.log('Sending registration request with data:', userData);
    
    const response = await axios.post('http://localhost:3000/auth/v2/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000 // Augmenter le timeout à 15 secondes pour le test
    });
    
    console.log('Registration successful!');
    console.log('Status code:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Registration failed!');
    
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
testRegister()
  .then((userData) => {
    console.log('Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed with error:', error.message);
    process.exit(1);
  });
