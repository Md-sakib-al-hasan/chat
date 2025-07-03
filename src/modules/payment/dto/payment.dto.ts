// src/modules/payment/payment.dto.ts

import { IsEmail, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    example: 1000,
    description: 'Amount to be paid in cents or your smallest currency unit',
  })
  @IsNumber()
  amount: number;
}
