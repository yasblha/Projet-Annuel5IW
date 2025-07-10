export class ContratNotFoundError extends Error {
  constructor(message = 'Contrat non trouvé') {
    super(message);
    this.name = 'ContratNotFoundError';
  }
}

export class ContratValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContratValidationError';
  }
} 