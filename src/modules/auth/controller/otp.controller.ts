// src/otp/otp.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from '../services/otp.services';
import { EmailService } from 'src/modules/utils/services/emailService';
import { SendOtpDto, VerifyOtpDto } from '../dto/otp.dto';
import { otpTemplate } from 'src/modules/utils/template/otptemplate';


@Controller('otp')
export class OtpController {
  constructor(
    private otpService: OtpService,
    private emailService: EmailService,
  ) {}

  @Post('send')
  async sendOtp(@Body() dto: SendOtpDto) {
    const otp = await this.otpService.generate(dto.email);

    await this.emailService.sendMail(
      dto.email,
      'Your OTP Code',
      otpTemplate('User', otp),
    );

    return { message: 'OTP sent successfully' };
  }

  @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.otpService.verify(dto.email, dto.otp);
  }
}
