export interface Contract {
  id: string;
  reference: string;
  tenantId: string;
  clientId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate?: string;
  status: ContractStatus;
  eligibilityData?: EligibilityData;
  meterData?: MeterData;
  quoteDetails?: QuoteDetails;
  notes?: string;
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface EligibilityData {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  eligibilityCheckResult?: boolean;
  eligibilityCheckDate?: string;
  zone?: string;
}

export interface MeterData {
  compteurId?: string;
  reference?: string;
  dateInstallation?: string;
  initialReading?: number;
}

export interface QuoteDetails {
  totalPrice?: number;
  currencyCode?: string;
  validUntil?: string;
  acceptedAt?: string;
}

export interface Cosignatary {
  id: string;
  contratId: string;
  cosignataireId?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: string;
  signatureDate?: string;
  signatureStatus: 'PENDING' | 'SIGNED' | 'REFUSED';
  invitationSentDate?: string;
}

export interface ContractAudit {
  id: string;
  contratId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateContractDto {
  clientId: string;
  startDate: string;
  endDate?: string;
  eligibilityData?: EligibilityData;
  meterData?: MeterData;
  quoteDetails?: QuoteDetails;
  notes?: string;
}

export interface UpdateContractDto {
  startDate?: string;
  endDate?: string;
  status?: ContractStatus;
  eligibilityData?: EligibilityData;
  meterData?: MeterData;
  quoteDetails?: QuoteDetails;
  notes?: string;
}

export interface ContractFilters {
  clientId?: string;
  status?: ContractStatus | ContractStatus[];
  startDateFrom?: string;
  startDateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
