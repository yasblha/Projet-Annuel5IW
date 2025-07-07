import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  email: string;

  @ApiProperty({ example: 'Dupont' })
  nom: string;

  @ApiProperty({ example: 'Jean' })
  prenom: string;

  @ApiProperty({ example: 'CLIENT' })
  role: string;

  @ApiProperty({ example: '0123456789', required: false })
  telephone?: string;

  @ApiProperty({ example: 'tenant123', required: false })
  tenantId?: string;

  @ApiProperty({ example: 'EN_ATTENTE_VALIDATION' })
  statut: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: UserResponse })
  data: UserResponse;

  @ApiProperty({ example: 'Opération réussie' })
  message?: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Erreur de validation' })
  error: string;

  @ApiProperty({ example: 400 })
  status: number;
}