import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from '../services/otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/send')
  async sendOtp(@Body('email') email: string): Promise<string> {
    // const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await this.otpService.sendOtpEmail(email);
    return 'OTP sent successfully';
  }
}
