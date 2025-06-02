import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InterventionType, InterventionPriority } from '../entities/intervention.entity';

export class CreateInterventionDto {
    @ApiProperty({ description: 'Titre de l\'intervention' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Description détaillée' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: InterventionType, description: 'Type d\'intervention' })
    @IsEnum(InterventionType)
    type: InterventionType;

    @ApiProperty({ enum: InterventionPriority, description: 'Priorité' })
    @IsEnum(InterventionPriority)
    priority: InterventionPriority;

    @ApiProperty({ description: 'Localisation' })
    @IsString()
    location: string;

    @ApiPropertyOptional({ description: 'Latitude' })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ description: 'Longitude' })
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiProperty({ description: 'Date prévue', type: 'string', format: 'date-time' })
    @IsDateString()
    scheduledDate: Date;

    @ApiPropertyOptional({ description: 'Durée estimée en minutes' })
    @IsOptional()
    @IsNumber()
    estimatedDuration?: number;

    @ApiPropertyOptional({ description: 'ID du technicien assigné' })
    @IsOptional()
    @IsUUID()
    technicianId?: string;

    @ApiPropertyOptional({ description: 'ID de l\'incident lié' })
    @IsOptional()
    @IsUUID()
    incidentId?: string;

    @ApiPropertyOptional({ description: 'Notes additionnelles' })
    @IsOptional()
    @IsString()
    notes?: string;
} 