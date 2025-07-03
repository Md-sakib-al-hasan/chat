// src/otp/otp.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';

import { addMinutes, isBefore } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  async generate(email: string) {
    const otp = generateOTP();
    const expiresAt = addMinutes(new Date(), 10);

    await this.prisma.otpVerification.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    return otp;
  }

  async verify(email: string, submittedOtp: string) {
    const record = await this.prisma.otpVerification.findFirst({
      where: { email, verified: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) throw new BadRequestException('OTP not found');

    if (record.otp !== submittedOtp)
      throw new BadRequestException('Invalid OTP');

    if (isBefore(record.expiresAt, new Date()))
      throw new BadRequestException('OTP expired');

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return { message: 'OTP verified successfully' };
  }
}


// src/utils/otp.util.ts
export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}
