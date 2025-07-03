import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from 'generated/prisma';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

 
}



export class UserFilterDto {
  @ApiPropertyOptional({ example: 'john', description: 'Partial match on name' })
  @IsOptional()
  @IsString()
  name_contains?: string;

  @ApiPropertyOptional({ example: 'gmail.com', description: 'Email ends with this value' })
  @IsOptional()
  @IsString()
  email_endsWith?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter users by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true') 
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'admin,user', description: 'Comma-separated roles' })
  @IsOptional()
  @IsString()
  role_in?: string;
}




