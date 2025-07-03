import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail_host'),
      port: this.configService.get<number>('mail_port'),
      secure: this.configService.get<boolean>('mail_secure'), 
      auth: {
        user: this.configService.get<string>('mail_user'),
        pass: this.configService.get<string>('mail_pass'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const mailOptions = {
        from: `"${this.configService.get('mail_from_name')}" <${this.configService.get('mail_from_email')}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent: ${info.messageId}`);
      return {
        success: true,
        message: 'Email sent successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to send email. Please try again later.');
    }
  }
}
