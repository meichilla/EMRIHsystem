import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PatientEMRService } from 'src/api/blockchain/services/patientemr.service';
import { AuthService } from 'src/api/auth/services/auth.service';
import { EmrService } from '../services/emr.service';
import { decrypt, encrypt } from 'src/common/utils/crypto';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { UseGuards } from '@nestjs/common';
import { ScheduleService } from 'src/api/schedule/services/schedule.service';
import { DoctorAssociationService } from 'src/api/blockchain/services/doctorassociation.service';

@Controller('emr')
export class EmrController {
  constructor(
    private readonly emrService: EmrService,
    private readonly authService: AuthService,
    private readonly patientEMRService: PatientEMRService,
    private readonly scheduleService: ScheduleService,
    private readonly doctorAssociationService: DoctorAssociationService,
  ) {}

  @Post('/login')
  async getPatientHashPassword(@Body() body: { data: string }) {
    const decryptedData = JSON.parse(decrypt(body.data));
    const patient = await this.authService.findPatient(decryptedData);
    const password = encrypt(JSON.stringify(patient.ppassword));
    return password;
  }

  @Post('/validate-login')
  async validateLogin(@Body() body: { data: string }) {
    const decryptedData = decrypt(body.data);
    const result = await this.patientEMRService.validateLoginCredentials(
      decryptedData,
      true,
    );
    return result;
  }

  @Post('/doctor-login/:hospitalid')
  async getDetailDoctor(
    @Param('hospitalid') hospitalid: number,
    @Body() body: { data: string },
  ) {
    const decryptedData = JSON.parse(decrypt(body.data));
    const doctor = await this.emrService.getDoctorByEmailandHospital(
      hospitalid,
      decryptedData.email,
    );
    const data = encrypt(JSON.stringify({ doctorData: doctor }));
    return data;
  }

  @Get('/latest-update/:patientid')
  @UseGuards(AuthMiddleware)
  async getLatestUpdate(@Param('patientid') patientid: number) {
    const latestUpdate = await this.patientEMRService.getLatestUpdate(
      patientid,
      false,
    );
    return latestUpdate;
  }

  @Get('/doctor/latest-update/:patientid/:walkin')
  async getLatestUpdateByDoctor(
    @Param('patientid') patientid: number,
    @Param('walkin') walkin: boolean,
  ) {
    const latestUpdate = await this.patientEMRService.getLatestUpdate(
      patientid,
      walkin,
    );
    const result = encrypt(JSON.stringify(latestUpdate));
    return result;
  }

  @Post('/my-patients')
  async getMyPatients(@Body() body: { data: string }) {
    const decryptedData = JSON.parse(decrypt(body.data));
    const patients = await this.emrService.getMyPatients(
      parseInt(decryptedData.docid, 10),
      parseInt(decryptedData.hospitalid, 10),
    );
    const data = encrypt(JSON.stringify({ patients: patients }));
    return data;
  }

  @Get('/patient-emr/:patientid')
  @UseGuards(AuthMiddleware)
  async getEMRDataByPatientId(@Param('patientid') pid: number) {
    const result = await this.patientEMRService.getEMRData(pid);
    const data = encrypt(JSON.stringify({ emr: result }));
    return data;
  }

  @Get('/latest-soap/:appointmentId')
  async getLatestSOAP(@Param('appointmentId') appointmentId: number) {
    const result = await this.patientEMRService.getLatestSOAP(appointmentId);
    const data = encrypt(JSON.stringify({ result }));
    return data;
  }

  @Get('/patient/latest-soap/:appointmentId')
  @UseGuards(AuthMiddleware)
  async getLatestSOAPPatient(@Param('appointmentId') appointmentId: number) {
    const result = await this.patientEMRService.getLatestSOAP(appointmentId);
    const data = encrypt(JSON.stringify({ result }));
    return data;
  }

  @Post('/get-token')
  async getToken(@Body() body: { data: string }) {
    const decryptedData = JSON.parse(decrypt(body.data));
    console.log(decryptedData);
    const isValidated =
      await this.doctorAssociationService.isDoctorAssociatedWithPatient(
        parseInt(decryptedData.appoid, 10),
        parseInt(decryptedData.docid, 10),
        decryptedData.walkin,
      );
    let results;
    if (isValidated) {
      const dataResult = await this.doctorAssociationService.getToken(
        parseInt(decryptedData.appoid, 10),
      );
      results = {
        token: dataResult.token,
        password: dataResult.password,
      };
    }
    const data = await encrypt(JSON.stringify({ results }));
    return data;
  }

  @Post('/get-emr')
  async getPatientEMRData(@Body() body: { data: string }) {
    const decryptedData = JSON.parse(decrypt(body.data));
    const emr = await this.patientEMRService.doctorGetEMRData(
      parseInt(decryptedData.appoid, 10),
      parseInt(decryptedData.docid, 10),
      decryptedData.token,
      decryptedData.walkin,
    );
    const data = encrypt(JSON.stringify({ emr: emr }));
    return data;
  }

  @Post('/soap')
  async submitSOAP(@Body() body: { data: string }) {
    const decryptedData = decrypt(body.data);
    const result = await this.patientEMRService.submitSOAP(decryptedData);
    return result.message;
  }

  @Post('/update/:patientid')
  @UseGuards(AuthMiddleware)
  async updatePatientEMR(
    @Param('patientid') pid: number,
    @Body() body: { data: string },
  ) {
    const decryptedData = decrypt(body.data);
    const result = await this.patientEMRService.updateEMRData(
      pid,
      decryptedData,
    );
    return result;
  }

  @Post('/sessions')
  async getDoctorSession(@Body() body: { data: string }) {
    const decryptedData = JSON.parse(decrypt(body.data));
    const result = await this.scheduleService.findAllSessionByDoctor(
      parseInt(decryptedData.docid, 10),
      parseInt(decryptedData.hospitalid, 10),
    );
    const data = encrypt(JSON.stringify({ sessions: result }));
    return data;
  }
}
