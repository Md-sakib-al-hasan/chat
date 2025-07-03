import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
  Req,
  BadRequestException,
  UnauthorizedException,
  Res,
  Param,
  Query,
} from '@nestjs/common';

import { ChangePasswordDto, forgotPasswordDto, RefreshTokenDto, ResetPasswordDto, TLoginUserDto } from '../dto/auth.dto';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.services';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { UserService } from 'src/modules/user/service/user.service';
import { JwtAuthGuard } from 'src/common/jwt/jwt.guard';
import { Request, Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService

  ) {}

  @Post('login')
  async login(@Body() loginDto: TLoginUserDto) {
    const data = await  this.authService.loginUser(loginDto)
    return   {
      message: 'Login User successfully',
      data
    };
    
  }

   @Post('registration')
    async create(@Body() createUserDto:CreateUserDto) {
      const createdUser = await this.userService.create(createUserDto);
       
      return {
        message: 'User created successfully',
        data: createdUser,
      };
    }
  

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Req() req: Request, @Body() payload: ChangePasswordDto) {
    const userData = req.user as { userId: string; role: string; userEmail: string };

    if (!payload.oldPassword || !payload.newPassword) {
      throw new BadRequestException('Old password and new password are required');
    }

    await this.authService.changePassword(userData, payload);

   
    return;
  }


@Post('refresh-token')
@ApiCookieAuth()
@ApiOperation({ summary: 'Refresh access token using refresh token from cookie' })
async refreshAccessToken(@Body() dto:RefreshTokenDto) {
  

  const refreshToken = dto.refreshToken

  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token is missing');
  }

  const result = await this.authService.refreshToken(refreshToken);
  console.log(result)
  return {
    message: 'Refresh token successfully',
    data: result,
  };
}



    @Post('forgot-password')
  async forgotPassword(@Body() dto:forgotPasswordDto) {
    return this.authService.forgetPassword(dto.email);
  }


   @Post('reset-password')
  @ApiQuery({ name: 'token', required: true })
  async resetPassword(
    @Body() payload: ResetPasswordDto,
    @Query('token') token: string,
  ) {
    return this.authService.resetPassword(payload, token);
  }

  
}
