import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppointmentService } from '../services/appointment.service';
import { JwtService } from 'src/api/jwt/services/jwt.service';
import { decrypt } from 'src/common/utils/crypto';
// import { JwtService } from 'src/api/jwt/services/jwt.service';

@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('upcoming/:hospitalId/:patientId')
  async getAllUpcomingAppointmentByPatient(
    @Param('hospitalId') hospitalId: number,
    @Param('patientId') pid: number,
  ) {
    const appointmentList =
      await this.appointmentService.findAllUpcomingBooking(hospitalId, pid);

    const newBookingCount = await this.appointmentService.findAllNewBooking(
      hospitalId,
      pid,
    );

    console.log('appointmentList :', appointmentList);
    console.log('newBookingCount :', newBookingCount);

    return {
      appointmentList: appointmentList,
      newBooking: newBookingCount,
    };
  }

  @Get('allpatients/:hospitalId')
  async getAllAppointmentByHospital(@Param('hospitalId') hospitalId: number) {
    const appointmentList =
      await this.appointmentService.findAllByHospital(hospitalId);

    return appointmentList;
  }

  @Get('/:hospitalId/:patientId')
  async getAllAppointmentByPatient(
    @Param('hospitalId') hospitalId: number,
    @Param('patientId') pid: number,
  ) {
    const appointmentList = await this.appointmentService.findAll(
      hospitalId,
      pid,
    );

    return appointmentList;
  }

  @Post('/create-appointment')
  async createAppointment(@Body() body: { data: string }) {
    const decryptedData = decrypt(body.data);
    const bookSession =
      await this.appointmentService.createAppointment(decryptedData);
    return bookSession;
  }

  @Post('/walkin/create-appointment')
  async createAppointmentWalkin(@Body() body: { data: string }) {
    const decryptedData = decrypt(body.data);
    const bookSession =
      await this.appointmentService.createWalkinAppointment(decryptedData);
    return bookSession;
  }

  @Get('/verify-token')
  verifyToken(token: string): any {
    try {
      const decodedToken = this.jwtService.verifyToken(token);
      return decodedToken;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('/walkin/check-appointment')
  async checkAppointment(
    @Body('patientId') pid: number,
    @Body('scheduleId') scheduleId: number,
  ) {
    const result = await this.appointmentService.checkAppointment(
      pid,
      scheduleId,
    );
    console.log('result :', result);
    return result;
  }

  @Post('/check-appointment')
  async checkAppointmentWalkin(
    @Body('pnic') pnic: string,
    @Body('scheduleId') scheduleId: number,
  ) {
    const result = await this.appointmentService.checkAppointmentForWalkin(
      pnic,
      scheduleId,
    );
    console.log('result :', result);
    return result;
  }
}
