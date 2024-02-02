import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as speakeasy from 'speakeasy';
import * as dotenv from 'dotenv';
// import { google } from 'googleapis';

dotenv.config();

@Injectable()
export class OtpService {
  private transporter: nodemailer.Transporter;

  // constructor() {
  //   const oAuth2Client = new google.auth.OAuth2(
  //     process.env.CLIENT_ID,
  //     process.env.CLIENT_SECRET,
  //     process.env.REDIRECT_URI,
  //   );

  //   // Set the Gmail API token credentials
  //   oAuth2Client.setCredentials({
  //     refresh_token: process.env.REFRESH_TOKEN,
  //   });

  //   this.transporter = nodemailer.createTransport({
  //     service: 'gmail',
  //     auth: {
  //       type: 'OAuth2',
  //       user: 'dappemr@gmail.com',
  //       clientId: process.env.CLIENT_ID,
  //       clientSecret: process.env.CLIENT_SECRET,
  //       refreshToken: process.env.REFRESH_TOKEN,
  //       accessToken: oAuth2Client.getAccessToken(),
  //     },
  //   });
  // }

  async sendOtpEmail(email: string) {
    try {
      const otp = this.generateOtp();
      await this.transporter.sendMail({
        from: 'dappemr@gmail.com',
        to: email,
        subject: `d'Appointment System OTP Code`,
        text: `Use the following code to verify your identity: ${otp}`,
      });

      console.log('OTP email sent successfully');
    } catch (error) {
      console.error('Failed to send OTP email', error);
      throw new Error('Failed to send OTP email');
    }
  }

  private generateOtp(): string {
    const secret = speakeasy.generateSecret({ length: 10, name: 'dAppEmr' });
    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
    });

    return otp;
  }
}

// const nodemailer = require('nodemailer')

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'ifritcompany@gmail.com', // Email Sender
//         pass: 'bbledoaixkzaqaov' // Key Generate
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// })

// module.exports = transporter

// const template = await fs.readFile(
//   path.resolve(__dirname, '../template/resetpassword.html'),
//   'utf-8',
// );
// const templateToCompile = await handlebars.compile(template);
// const newTemplate = templateToCompile({
//   name: data.name,
//   email,
//   url: `https://jcwd230201.purwadhikabootcamp.com/reset-password/${data.id}`,
// });
// await transporter.sendMail({
//   from: 'iFrit',
//   to: email,
//   subject: 'Reset Password',
//   html: newTemplate,
// });
