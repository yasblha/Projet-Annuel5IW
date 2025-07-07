import {IsEmail, IsString, IsOptional, IsIn, Matches, MinLength, MaxLength, IsNotEmpty,} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';


export class RegisterDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    nom: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    prenom: string;

    @ApiProperty({ example:'test@gmail.com'})
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Password1234!' })
    @IsNotEmpty()
    @IsString()
    @MinLength(12)
    @MaxLength(128)
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+/, { message:  'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un symbole.',})
    motDePasse: string;

    @ApiProperty({ example: 'Password1234!' })
    @IsOptional()
    @IsString()
    @MinLength(12)
    @MaxLength(128)
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+/, { message:  'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un symbole.',})
    password?: string;

    @ApiProperty({ example: '0123456789' })
    @IsOptional()
    @IsString()
    telephone?: string;

    @ApiProperty({ example: 'tenant123' })
    @IsOptional()
    @IsString()
    tenantId: string;

    @ApiProperty({ example: 'CLIENT' })
    @IsNotEmpty()
    @IsIn([
        'CLIENT',
        'ADMIN',
        'TECHNICIEN',
        'COMMERCIAL',
        'SUPPORT',
        'COMPTABLE',
        'MANAGER',
    ])
    role: 'CLIENT' | 'ADMIN' | 'TECHNICIEN' | 'COMMERCIAL' | 'SUPPORT' | 'COMPTABLE' | 'MANAGER';
}
