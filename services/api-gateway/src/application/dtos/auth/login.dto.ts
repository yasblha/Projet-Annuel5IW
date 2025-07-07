import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'jean.dupont@example.com',
    description: 'Adresse email de l\'utilisateur'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'MotDePasse123!',
    description: 'Mot de passe de l\'utilisateur'
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}