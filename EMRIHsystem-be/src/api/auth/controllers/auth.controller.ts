/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { PatientEMRService } from 'src/api/blockchain/services/patientemr.service';
import { decrypt, encrypt } from 'src/common/utils/crypto';
import { JwtService } from 'src/api/jwt/services/jwt.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly patientEMRService: PatientEMRService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('/login')
  async getPatientHashPassword(@Body() body: { data: string }) {
    const decryptedData = JSON.parse(decrypt(body.data));
    const patient = await this.authService.findPatient(decryptedData);
    const password = encrypt(JSON.stringify(patient.ppassword));
    return password;
  }

  @Post('/admin')
  async getAdminHashPassword(@Body() body: { data: string }) {
    const decryptedData = JSON.parse(decrypt(body.data));
    const admin = await this.authService.findAdmin(decryptedData);
    const result = encrypt(JSON.stringify({
      password: admin.password,
      email: admin.email,
      username: admin.username,
      }
    ));
    return result;
  }

  @Post('/validate-login')
  async validateLogin(@Body() body: { data: string }) {
    const decryptedData = decrypt(body.data);
    const result = await this.patientEMRService.validateLoginCredentials(
      decryptedData,
      false,
    );
    console.log('result', result);
    return result;
  }

  @Post('/logout')
  async logoutPatient(@Body('pid') pid: number) {
    await this.patientEMRService.updateTokenPatient(pid);
    return 'Logout patient';
  }

  @Post('/refresh-token')
  async refreshToken(@Body() body: { refreshToken: string}) {
    console.log(this.refreshToken);
    const { accessToken } = await this.jwtService.refreshToken(
      body.refreshToken,
    );
    return { accessToken };
  }
}
