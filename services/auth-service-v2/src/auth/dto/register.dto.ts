import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'admin@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Password (min 12 chars, must include uppercase, lowercase, number, special char)',
    example: 'StrongP@ssw0rd123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character' })
  password: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'ADMIN',
    required: false,
  })
  @IsString()
  role?: string;

  @ApiProperty({
    description: 'Name of the agency',
    example: 'My Agency',
  })
  @IsString()
  @IsNotEmpty({ message: 'Agency name is required' })
  agencyName: string;
}
