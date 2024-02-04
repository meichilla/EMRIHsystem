import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as speakeasy from 'speakeasy';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class OtpService {
  private transporter;

  constructor() {
    this.transporter = createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendOtpEmail(email: string) {
    try {
      const otp = this.generateOtp();
      console.log(otp);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `EMR-IH - Verification OTP`,
        text: `Your OTP for registration is: ${otp}`,
      };
      console.log(mailOptions);
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send OTP email', error);
      throw new Error('Failed to send OTP email');
    }
  }

  private generateOtp(): string {
    const secret = speakeasy.generateSecret({ length: 4, name: 'EMR-IH' });
    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
    });

    return otp;
  }
}
