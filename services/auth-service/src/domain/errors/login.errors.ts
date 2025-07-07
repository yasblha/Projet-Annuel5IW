export class LoginErrors extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoginErrors';
  }

  static UsernameDoesNotExist(): LoginErrors {
    return new LoginErrors('❌ Email ou mot de passe incorrect.');
  }
}