import { IsEnum, IsOptional, IsPositive, IsString, IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListClientsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  // Identité
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsEnum(['ACTIF', 'INACTIF', 'SUSPENDU'])
  statut?: string;

  // Adresse
  @IsOptional()
  @IsString()
  ligne1?: string;

  @IsOptional()
  @IsString()
  ligne2?: string;

  @IsOptional()
  @IsString()
  codePostal?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  pays?: string;

  @IsOptional()
  @IsEnum(['PRINCIPALE', 'FACTURATION', 'LIVRAISON'])
  typeAdresse?: string;

  // Compteur et Abonnement
  @IsOptional()
  @IsString()
  numeroCompteur?: string;

  @IsOptional()
  @IsEnum(['EAU_FROIDE', 'EAU_CHAUDE', 'ELECTRIQUE'])
  typeCompteur?: string;

  @IsOptional()
  @IsEnum(['ACTIF', 'INACTIF', 'MAINTENANCE'])
  statutCompteur?: string;

  @IsOptional()
  @IsString()
  emplacementCompteur?: string;

  @IsOptional()
  @IsDateString()
  dateDebutAbonnement?: string;

  @IsOptional()
  @IsDateString()
  dateFinAbonnement?: string;

  @IsOptional()
  @IsEnum(['MENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE'])
  frequenceAbonnement?: string;

  // Contrat
  @IsOptional()
  @IsString()
  numeroContrat?: string;

  @IsOptional()
  @IsEnum(['EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'TERMINE'])
  statutContrat?: string;

  @IsOptional()
  @IsEnum(['PARTICULIER', 'ENTREPRISE', 'COPROPRIETE'])
  typeProprietaire?: string;

  @IsOptional()
  @IsDateString()
  dateDebutContrat?: string;

  @IsOptional()
  @IsDateString()
  dateFinContrat?: string;

  // Entreprise
  @IsOptional()
  @IsString()
  nomEntreprise?: string;

  @IsOptional()
  @IsString()
  siret?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactTelephone?: string;

  // Facturation
  @IsOptional()
  @IsString()
  numeroFacture?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  montantHT?: number;

  @IsOptional()
  @IsDateString()
  dateEmission?: string;

  @IsOptional()
  @IsDateString()
  dateEcheance?: string;

  // Interventions
  @IsOptional()
  @IsEnum(['INSTALLATION', 'MAINTENANCE', 'REPARATION', 'RELEVE', 'DEMENAGEMENT'])
  typeIntervention?: string;

  @IsOptional()
  @IsEnum(['PROGRAMMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'])
  statutIntervention?: string;

  @IsOptional()
  @IsDateString()
  datePlanifiee?: string;

  @IsOptional()
  @IsDateString()
  dateRealisee?: string;
} 