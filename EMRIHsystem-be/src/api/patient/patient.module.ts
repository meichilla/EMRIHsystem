import { Module } from '@nestjs/common';
import { PatientController } from './controllers/patient.controller';
import { OtpService } from '../otp/services/otp.service';
import { PatientService } from './services/patient.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Patient } from 'src/entities/patient/patient.entity';
import { User } from 'src/entities/user/user.entity';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { Specialties } from 'src/entities/specialties/specialties.entity';
import { PatientEMRService } from '../blockchain/services/patientemr.service';
import { JwtService } from '../jwt/services/jwt.service';
import { LogChanges } from 'src/entities/logchanges/logchanges.entity';
import { LogHistory } from 'src/entities/loghistory/loghistory.entity';
import { DoctorAssociationService } from '../blockchain/services/doctorassociation.service';
import { Schedule } from 'src/entities/schedule/schedule.entity';
import { Appointment } from 'src/entities/appointment/appointment.entity';
import { Hospital } from 'src/entities/hospital/hospital.entity';
import { HospitalService } from '../hospital/services/hospital.service';
import { NotificationService } from '../notifications/services/notification.service';
import { Notification } from 'src/entities/notifications/notifications.entity';
import { EmrService } from '../emr/services/emr.service';
import { DoctorService } from '../doctor/services/doctor.service';
import { AppointmentService } from '../appointment/services/appointment.service';
import { ScheduleService } from '../schedule/services/schedule.service';
import { Walkinpatient } from 'src/entities/walkinpatient/walkinpatient.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Patient,
      User,
      Doctor,
      Specialties,
      LogChanges,
      LogHistory,
      Schedule,
      Appointment,
      Hospital,
      Notification,
      Walkinpatient,
    ]),
  ],
  controllers: [PatientController],
  providers: [
    PatientEMRService,
    OtpService,
    PatientService,
    JwtService,
    DoctorAssociationService,
    HospitalService,
    NotificationService,
    EmrService,
    DoctorService,
    AppointmentService,
    ScheduleService,
  ],
})
export class PatientModule {}
