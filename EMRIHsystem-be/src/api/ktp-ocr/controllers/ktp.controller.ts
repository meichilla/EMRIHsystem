import { Controller, Post, Body } from '@nestjs/common';
import { KtpService } from '../services/ktp.service';

interface OcrResult {
  name: string;
  dob: string;
  nik: string;
}

@Controller('ktp')
export class KtpController {
  constructor(private readonly ktpService: KtpService) {}

  @Post('/ocr')
  async ocr(@Body() body: { image: string }): Promise<OcrResult> {
    const result: OcrResult = await this.ktpService.processOcr(body.image);
    return result;
  }
}
