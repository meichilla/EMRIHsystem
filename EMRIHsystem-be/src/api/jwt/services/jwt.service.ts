import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { PatientService } from 'src/api/patient/services/patient.service';
import { DoctorService } from 'src/api/doctor/services/doctor.service';

dotenv.config();

@Injectable()
export class JwtService {
  constructor(
    private readonly patientService: PatientService,
    private readonly doctorService: DoctorService,
  ) {}

  private readonly secretKey: string = process.env.SECRET_KEY;

  generateTokenWithExpiration(payload: any, expiresIn: string): string {
    return jwt.sign(payload, this.secretKey, { expiresIn });
  }

  verifyToken(token: string): { valid: boolean; decoded?: any } {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false };
    }
  }

  generateAccessToken(email: string): string {
    const payload = { email: email };
    return jwt.sign(payload, this.secretKey, { expiresIn: '5m' });
  }

  generateRefreshToken(email: string): string {
    const payload = { email: email };
    return jwt.sign(payload, this.secretKey, { expiresIn: '10m' });
  }

  async refreshToken(refreshToken: string) {
    // Validate the refresh token and issue a new access token
    const decoded = this.verifyToken(refreshToken);
    console.log(decoded);

    const patient = await this.patientService.findPatientByEmail(
      decoded.decoded.email,
    );
    const newAccessToken = this.generateAccessToken(patient.pemail);

    return { accessToken: newAccessToken };
  }
}
