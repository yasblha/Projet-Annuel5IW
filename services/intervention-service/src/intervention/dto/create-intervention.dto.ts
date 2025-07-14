import { IsUUID, IsDateString, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateInterventionDto {
  @IsOptional()
  @IsUUID()
  utilisateurId?: string;

  @IsOptional()
  @IsUUID()
  compteurId?: string;
  
  @IsOptional()
  @IsUUID()
  contratId?: string;

  @IsIn(['INSTALLATION', 'REPARATION', 'RELEVE'])
  type!: 'INSTALLATION' | 'REPARATION' | 'RELEVE';

  @IsDateString()
  datePlanifiee!: string;

  @IsOptional()
  @IsUUID()
  technicienId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['HAUTE', 'MOYENNE', 'BASSE'])
  priorite?: 'HAUTE' | 'MOYENNE' | 'BASSE';
}
