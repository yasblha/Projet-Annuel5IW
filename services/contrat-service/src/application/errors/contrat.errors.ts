export enum ErrorCode {
  // === ERREURS DE VALIDATION ===
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONTRAT_NOT_FOUND = 'CONTRAT_NOT_FOUND',
  CONTRAT_NOT_MODIFIABLE = 'CONTRAT_NOT_MODIFIABLE',
  CONTRAT_NOT_SIGNABLE = 'CONTRAT_NOT_SIGNABLE',
  CONTRAT_ALREADY_SIGNED = 'CONTRAT_ALREADY_SIGNED',
  CONTRAT_NOT_TERMINABLE = 'CONTRAT_NOT_TERMINABLE',
  CONTRAT_ALREADY_TERMINATED = 'CONTRAT_ALREADY_TERMINATED',
  CONTRAT_NOT_SUSPENDABLE = 'CONTRAT_NOT_SUSPENDABLE',
  CONTRAT_ALREADY_SUSPENDED = 'CONTRAT_ALREADY_SUSPENDED',
  CONTRAT_NOT_RENEWABLE = 'CONTRAT_NOT_RENEWABLE',
  SIGNATURE_REQUIRED = 'SIGNATURE_REQUIRED',
  CERTIFICAT_REQUIRED = 'CERTIFICAT_REQUIRED',
  MOTIF_TOO_SHORT = 'MOTIF_TOO_SHORT',
  DATE_INVALID = 'DATE_INVALID',
  DATE_REQUIRED = 'DATE_REQUIRED',
  DURATION_TOO_LONG = 'DURATION_TOO_LONG',

  // === ERREURS D'ACCÈS ===
  ACCESS_DENIED = 'ACCESS_DENIED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // === ERREURS INTER-SERVICES ===
  INTER_SERVICE_ERROR = 'INTER_SERVICE_ERROR',
  CLIENT_NOT_FOUND = 'CLIENT_NOT_FOUND',
  COMPTEUR_NOT_FOUND = 'COMPTEUR_NOT_FOUND',
  ABONNEMENT_NOT_FOUND = 'ABONNEMENT_NOT_FOUND',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // === ERREURS DE BASE DE DONNÉES ===
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',

  // === ERREURS D'AUDIT ===
  AUDIT_ERROR = 'AUDIT_ERROR',
  AUDIT_TRAIL_NOT_FOUND = 'AUDIT_TRAIL_NOT_FOUND',

  // === ERREURS DE NOTIFICATION ===
  NOTIFICATION_ERROR = 'NOTIFICATION_ERROR',
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  SMS_SEND_FAILED = 'SMS_SEND_FAILED',

  // === ERREURS DE GÉNÉRATION ===
  NUMBER_GENERATION_ERROR = 'NUMBER_GENERATION_ERROR',
  SEQUENCE_OVERFLOW = 'SEQUENCE_OVERFLOW',

  // === ERREURS MÉTIER ===
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  COSIGNATAIRE_ERROR = 'COSIGNATAIRE_ERROR',
  COMPTEUR_ASSOCIATION_ERROR = 'COMPTEUR_ASSOCIATION_ERROR',

  // === ERREURS SYSTÈME ===
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export class ContratError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number = 400,
    public details?: any,
    public field?: string
  ) {
    super(message);
    this.name = 'ContratError';
  }

  toResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
        field: this.field,
        details: this.details,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export class ValidationError extends ContratError {
  constructor(message: string, field?: string, details?: any) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details, field);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ContratError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} avec l'ID ${id} non trouvé` : `${resource} non trouvé`;
    super(message, ErrorCode.CONTRAT_NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

export class AccessDeniedError extends ContratError {
  constructor(message: string = 'Accès non autorisé') {
    super(message, ErrorCode.ACCESS_DENIED, 403);
    this.name = 'AccessDeniedError';
  }
}

export class BusinessRuleViolationError extends ContratError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.BUSINESS_RULE_VIOLATION, 422, details);
    this.name = 'BusinessRuleViolationError';
  }
}

export class InterServiceError extends ContratError {
  constructor(service: string, message: string, details?: any) {
    super(`Erreur ${service}: ${message}`, ErrorCode.INTER_SERVICE_ERROR, 502, details);
    this.name = 'InterServiceError';
  }
}

export class DatabaseError extends ContratError {
  constructor(message: string, details?: any) {
    super(`Erreur de base de données: ${message}`, ErrorCode.DATABASE_ERROR, 500, details);
    this.name = 'DatabaseError';
  }
}

export class NotificationError extends ContratError {
  constructor(type: 'EMAIL' | 'SMS', message: string, details?: any) {
    const code = type === 'EMAIL' ? ErrorCode.EMAIL_SEND_FAILED : ErrorCode.SMS_SEND_FAILED;
    super(`Erreur d'envoi ${type}: ${message}`, code, 500, details);
    this.name = 'NotificationError';
  }
}

export class StateTransitionError extends ContratError {
  constructor(fromState: string, toState: string, reason?: string) {
    const message = `Transition impossible de ${fromState} vers ${toState}${reason ? `: ${reason}` : ''}`;
    super(message, ErrorCode.INVALID_STATE_TRANSITION, 422);
    this.name = 'StateTransitionError';
  }
}

// === UTILITAIRES D'ERREUR ===
export class ErrorHandler {
  static handle(error: any): ContratError {
    // Si c'est déjà une ContratError, la retourner
    if (error instanceof ContratError) {
      return error;
    }

    // Gestion des erreurs de validation class-validator
    if (error.name === 'ValidationError' || error.name === 'ValidatorError') {
      return new ValidationError(error.message, error.property);
    }

    // Gestion des erreurs Sequelize
    if (error.name === 'SequelizeValidationError') {
      return new ValidationError('Erreur de validation des données', undefined, error.errors);
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return new ValidationError('Violation de contrainte d\'unicité', undefined, error.errors);
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return new ValidationError('Référence invalide', undefined, error.errors);
    }

    // Gestion des erreurs HTTP
    if (error.status === 404) {
      return new NotFoundError('Ressource');
    }

    if (error.status === 403) {
      return new AccessDeniedError();
    }

    if (error.status === 502 || error.status === 503) {
      return new InterServiceError('Service externe', error.message);
    }

    // Erreur par défaut
    return new ContratError(
      error.message || 'Erreur interne du serveur',
      ErrorCode.INTERNAL_SERVER_ERROR,
      500,
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    );
  }

  static logError(error: ContratError, context?: any): void {
    const logData = {
      timestamp: new Date().toISOString(),
      error: {
        code: error.code,
        message: error.message,
        field: error.field,
        statusCode: error.statusCode
      },
      context,
      stack: error.stack
    };

    console.error('ContratService Error:', JSON.stringify(logData, null, 2));
  }
}

// === CODES D'ERREUR MÉTIER ===
export const BusinessErrorCodes = {
  CONTRAT_CREATION_FAILED: 'CONTRAT_CREATION_FAILED',
  CONTRAT_UPDATE_FAILED: 'CONTRAT_UPDATE_FAILED',
  CONTRAT_DELETION_FAILED: 'CONTRAT_DELETION_FAILED',
  COSIGNATAIRE_CREATION_FAILED: 'COSIGNATAIRE_CREATION_FAILED',
  SIGNATURE_FAILED: 'SIGNATURE_FAILED',
  RESILIATION_FAILED: 'RESILIATION_FAILED',
  SUSPENSION_FAILED: 'SUSPENSION_FAILED',
  RENOUVELLEMENT_FAILED: 'RENOUVELLEMENT_FAILED',
  COMPTEUR_ASSOCIATION_FAILED: 'COMPTEUR_ASSOCIATION_FAILED',
  AUDIT_TRAIL_FAILED: 'AUDIT_TRAIL_FAILED',
  NOTIFICATION_FAILED: 'NOTIFICATION_FAILED'
} as const; 