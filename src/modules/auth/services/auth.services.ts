import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { HttpStatus } from '@nestjs/common';
import { AppError } from 'src/errors/AppError';
import { UserStatus } from 'generated/prisma';
import { TLoginUserDto } from '../dto/auth.dto';
import { EmailService } from 'src/modules/utils/services/emailService';
import { otpTemplate } from 'src/modules/utils/template/otptemplate';
import { resetPasswordTemplate } from 'src/modules/utils/template/resetpassowordtemplate';
import { addMinutes, isBefore } from 'date-fns';
import { JwtPayload } from 'src/types/RequestWithUser';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) { }

  async loginUser(payload: TLoginUserDto) {
    const { email, password } = payload;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        otpVerification: true,
      },
    });

    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, 'This user is not found!');
    }

    if (user.isDeleted) {
      throw new AppError(HttpStatus.FORBIDDEN, 'This user is deleted!');
    }

    if (user.status === UserStatus.BANNED) {
      throw new AppError(HttpStatus.FORBIDDEN, 'This user is blocked!');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new AppError(HttpStatus.FORBIDDEN, 'Password does not match');
    }

    if (!user.otpVerification || user.otpVerification.verified === false) {
      throw new ForbiddenException('OTP not verified. Please verify your email.');
    }



    const jwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('jwt_access_secret'),
      expiresIn: this.configService.get<string>('jwt_access_expires_in'),
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('jwt_refresh_secret'),
      expiresIn: this.configService.get<string>('jwt_refresh_expires_in'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }


 async changePassword(
    userData: JwtPayload,
    payload: { oldPassword: string; newPassword: string },
  ): Promise<null> {
    // Fetch user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: userData.userId },
    });

    if (!user) {
      throw new NotFoundException('This user is not found!');
    }

    if (user.isDeleted) {
      throw new ForbiddenException('This user is deleted!');
    }

    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException('This user is blocked!');
    }

    // Verify old password
    const isMatch = await bcrypt.compare(payload.oldPassword, user.password);
    if (!isMatch) {
      throw new ForbiddenException('Password does not match');
    }

    const saltRounds = Number(this.configService.get<string>('bcrypt_salt_rounds')) || 10;
    const newHashedPassword = await bcrypt.hash(payload.newPassword, saltRounds);

    // Update user password and related fields
    await this.prisma.user.update({
      where: {
        id: userData.userId,
      },
      data: {
        password: newHashedPassword,
      },
    });

    return null;
  }


 async refreshToken(refreshToken: string) {
    let decoded: any;

    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt_refresh_secret'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { userId, iat } = decoded;
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isDeleted || user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Unauthorized');
    }

   const jwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('jwt_access_secret'),
      expiresIn: this.configService.get<string>('jwt_access_expires_in'),
    });

   
    return accessToken;
  }


async forgetPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('This user is not found!');
    }

    if (user.isDeleted) {
      throw new ForbiddenException('This user is deleted!');
    }

    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException('This user is blocked!');
    }

    const jwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    

    const token = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('jwt_access_secret'),
      expiresIn: this.configService.get<string>('jwt_access_expires_in'),
    });

    const resetLink = `${this.configService.get<string>('reset_pass_ui_link')}?id=${user.id}&token=${token}`;

    await this.emailService.sendMail(
      user.email,
      'Reset Your Password',
      resetPasswordTemplate(user.name,resetLink)
    );

    console.log('Reset link:', resetLink);
  }


  async resetPassword(payload: { id: string; newPassword: string }, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new NotFoundException('This user is not found!');
    }

    if (user.isDeleted) {
      throw new ForbiddenException('This user is deleted!');
    }

    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException('This user is blocked!');
    }

    let decoded: JwtPayload;

    try {
      decoded = this.jwtService.verify<JwtPayload>(
        token,
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        },
      );
    } catch (err) {
      throw new BadRequestException('Invalid or expired token!');
    }

    if (decoded.userId !== payload.id) {
      throw new ForbiddenException('You are forbidden!');
    }

    const hashedPassword = await bcrypt.hash(
      payload.newPassword,
      Number(this.configService.get('BCRYPT_SALT_ROUNDS')),
    );

    await this.prisma.user.update({
      where: { id: decoded.userId },
      data: {
        password: hashedPassword,

      },
    });

    return { message: 'Password reset successful!' };
  }
 

}





