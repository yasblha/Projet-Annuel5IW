import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token received by email',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  @ApiProperty({
    description: 'New password (min 12 chars, must include uppercase, lowercase, number, special char)',
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
}
