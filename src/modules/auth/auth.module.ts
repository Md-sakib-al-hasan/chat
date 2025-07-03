// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/common/jwt/jwt.strategy';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.services';
import { UserModule } from '../user/user.module';
import { UtilsModule } from '../utils/utils.module';
import { OtpController } from './controller/otp.controller';
import { OtpService } from './services/otp.services';


@Module({
  imports: [
    UserModule,
    UtilsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt_access_secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt_access_expires_in'),
        },
      }),
    }),
  ],
  controllers: [AuthController,OtpController],
  providers: [AuthService, JwtStrategy,OtpService],
})
export class AuthModule {}
