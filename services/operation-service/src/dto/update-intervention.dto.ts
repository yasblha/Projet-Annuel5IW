import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateInterventionDto } from './create-intervention.dto';
import { InterventionStatus } from '../entities/intervention.entity';

export class UpdateInterventionDto extends PartialType(CreateInterventionDto) {
    @IsOptional()
    @IsEnum(InterventionStatus)
    status?: InterventionStatus;
} 