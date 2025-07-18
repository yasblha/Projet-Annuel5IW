import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur pour lequel rafraîchir le token',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty({ message: 'L\'ID utilisateur est requis' })
  @IsUUID(4, { message: 'L\'ID utilisateur doit être un UUID valide' })
  userId: string;
}
