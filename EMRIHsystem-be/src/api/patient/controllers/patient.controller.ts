import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OtpService } from 'src/api/otp/services/otp.service';
import { PatientService } from '../services/patient.service';
import { PatientEMRService } from 'src/api/blockchain/services/patientemr.service';
import { decrypt } from 'src/common/utils/crypto';

@Controller('patients')
export class PatientController {
  constructor(
    private readonly patientEMRService: PatientEMRService,
    private readonly otpService: OtpService,
    private readonly patientService: PatientService,
  ) {}

  @Post('/register')
  async registerPatient(@Body() body: { data: string }) {
    const decryptedData = decrypt(body.data);
    const result = this.patientEMRService.registerPatient(decryptedData);
    return result;
  }

  @Post('/isRegistered')
  async checkPatientExistByNIC(
    @Body() body: { data: string },
  ): Promise<boolean> {
    const decryptedData = decrypt(body.data);
    const result = this.patientEMRService.isNICAlreadyRegistered(decryptedData);
    return result;
  }

  @Post('/register-walkin/:hospitalid')
  async registerWalkinPatient(
    @Param('hospitalid') hospitalid: number,
    @Body() body: { data: string },
  ) {
    const decryptedData = decrypt(body.data);
    const result = this.patientEMRService.registerPatientWalkIn(
      decryptedData,
      hospitalid,
    );
    return result;
  }

  @Get('/patient-details/:nic')
  async getPatientDetails(@Param('nic') nic: string) {
    const result = this.patientEMRService.getPatientDetails(nic);
    return result;
  }

  @Get('/patient-list/:hospitalid')
  async getAllPatientList(@Param('hospitalid') hospitalid: number) {
    return this.patientService.findAllPatient(hospitalid);
  }
}
