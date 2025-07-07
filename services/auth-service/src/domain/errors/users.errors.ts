export class UserNotFoundError extends Error {
  constructor(message = 'Utilisateur non trouvé') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor(message = 'Cet email est déjà utilisé') {
    super(message);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class CannotDeleteYourselfError extends Error {
  constructor(message = 'Vous ne pouvez pas supprimer votre propre compte') {
    super(message);
    this.name = 'CannotDeleteYourselfError';
  }
} 