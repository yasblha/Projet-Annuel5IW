import { IsString, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IncidentType, IncidentPriority } from '../entities/incident.entity';

export class CreateIncidentDto {
    @ApiProperty({ description: 'Titre de l\'incident' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Description de l\'incident' })
    @IsString()
    description: string;

    @ApiProperty({ enum: IncidentType, description: 'Type d\'incident' })
    @IsEnum(IncidentType)
    type: IncidentType;

    @ApiProperty({ enum: IncidentPriority, description: 'Priorité' })
    @IsEnum(IncidentPriority)
    priority: IncidentPriority;

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

    @ApiPropertyOptional({ description: 'Nom du déclarant' })
    @IsOptional()
    @IsString()
    reportedBy?: string;

    @ApiPropertyOptional({ description: 'Contact du déclarant' })
    @IsOptional()
    @IsString()
    reporterContact?: string;

    @ApiPropertyOptional({ description: 'Pièces jointes', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];
} 