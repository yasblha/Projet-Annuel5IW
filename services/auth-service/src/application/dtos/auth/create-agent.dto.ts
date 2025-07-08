import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsIn,
  MinLength,
  MaxLength,
  Matches,
  IsOptional
} from 'class-validator';

const roles = ['ADMIN', 'TECHNICIEN', 'COMMERCIAL', 'SUPPORT', 'COMPTABLE', 'MANAGER'] as const;
export type UserRole = typeof roles[number];

export class CreateAgentDto {
  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiProperty({
    example: 'ADMIN',
    enum: roles,
    description: 'Rôle du nouvel agent'
  })
  @IsIn(roles)
  role: UserRole;

  @ApiProperty({ example: 'tenant123', required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;
}