import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
@Injectable()
export class KtpService {
  async processOcr(
    imageBase64: string,
  ): Promise<{ name: string; dob: string; nik: string }> {
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Configure Tesseract for Indonesian language
    const { data } = await Tesseract.recognize(imageBuffer, 'ind');

    // Extracted text from OCR
    const extractedText = data.text.trim();

    const nameRegex = /Nama(?:-|:)\s*(.+)/;
    const dobRegex = /Tgl Lahir(?:-|:)\s*(.+)/;
    const nikRegex = /NIK(?:-|:)\s*(.+)/;
    console.log(extractedText);
    const nameMatch = extractedText.match(nameRegex);
    const dobMatch = extractedText.match(dobRegex);
    const nikMatch = extractedText.match(nikRegex);

    console.log(nameMatch);
    console.log(dobMatch);
    console.log(nikMatch);
    const name = nameMatch ? nameMatch[1] : '';
    const dob = dobMatch ? dobMatch[1] : '';
    const nik = nikMatch ? nikMatch[1] : '';

    return { name, dob, nik };
  }
}
