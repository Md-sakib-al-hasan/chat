// src/modules/payment/payment.controller.ts

import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Param,
  Headers,
  RawBodyRequest,
  Res,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CreatePaymentDto } from '../dto/payment.dto';
import Stripe from 'stripe';

import { PaymentService } from '../services/payment.services';
import { JwtAuthGuard } from 'src/common/jwt/jwt.guard';
import { RolesGuard } from 'src/common/jwt/roles.guard';
import { Roles } from 'src/common/jwt/roles.decorator';
import { UserRole } from 'generated/prisma';



@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

@UseGuards(JwtAuthGuard, RolesGuard)
 @Roles(UserRole.USER)
 @Post('/')
  async create(@Body() dto: CreatePaymentDto, @Req() req) {
     
   
    const data = await this.paymentService.createPayment(dto,req.user.userId);
    return  {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Payment created successfully',
      data,
    };
  }
  
  @Post('/webhook')
  async webhook(@Headers('stripe-signature') signature: string, @Req() req: RawBodyRequest<Request>) {
    return this.paymentService.handleWebhook(req);
  }



  
  

  
  
}
