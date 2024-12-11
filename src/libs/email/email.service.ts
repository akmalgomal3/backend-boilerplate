import { HttpException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';
import { ConfigService } from '@nestjs/config';
import {
  greetingTemplate,
  resetPasswordTemplate,
} from './templates/email.template';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly senderEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: configService.get('EMAIL_SENDER'),
        pass: configService.get('EMAIL_APP_PASSWORD'),
      },
    });

    this.senderEmail = configService.get('EMAIL_SENDER');
  }

  async sendEmail(emailDto: SendEmailDto) {
    try {
      const emailData = {
        ...emailDto,
        from: this.senderEmail,
      };

      await this.transporter.sendMail(emailData);
    } catch (e) {
      throw new HttpException(
        e.message || 'Internal server error',
        e.status || 500,
      );
    }
  }

  generateGreetingEmail(name: string) {
    return greetingTemplate(name);
  }

  generatePasswordResetEmail(name: string, token: string) {
    return resetPasswordTemplate(name, token);
  }
}
