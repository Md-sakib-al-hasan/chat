import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TLoginUserDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
     example: 'password123' ,
    description: 'The password of the user (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  password: string;
}




export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'oldPassword123',
  })
  @IsString()
  @MinLength(6, { message: 'Old password must be at least 6 characters' })
  oldPassword: string;

  @ApiProperty({
    description: 'New password to set',
    example: 'newPassword456',
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword: string;
}


export class forgotPasswordDto {
  @ApiProperty({
    example: 'user@gmail.com',
    description: 'The email address associated with the OTP',
  })
  @IsEmail()
  email: string;
}


// src/user/dto/reset-password.dto.ts



export class ResetPasswordDto {
  @ApiProperty({
    example: 'A-0001',
    description: 'The user ID of the account resetting the password',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'NewStrongPass123!',
    description: 'The new password to set for the user',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}




// src/modules/auth/dto/refresh-token.dto.ts



export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token issued during login',
  })
  @IsString({ message: 'Refresh token must be a string.' })
  @MinLength(10, { message: 'Refresh token must be at least 10 characters long.' })
  refreshToken: string;
}


