import { Module } from '@nestjs/common';
import { Schedule } from 'src/entities/schedule/schedule.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { AppointmentController } from './controllers/appointment.controller';
import { AppointmentService } from './services/appointment.service';
import { Appointment } from 'src/entities/appointment/appointment.entity';
import { JwtService } from '../jwt/services/jwt.service';
import { Patient } from 'src/entities/patient/patient.entity';
import { User } from 'src/entities/user/user.entity';
import { Specialties } from 'src/entities/specialties/specialties.entity';
import { PatientEMRService } from '../blockchain/services/patientemr.service';
import { LogChanges } from 'src/entities/logchanges/logchanges.entity';
import { LogHistory } from 'src/entities/loghistory/loghistory.entity';
import { DoctorAssociationService } from '../blockchain/services/doctorassociation.service';
import { Hospital } from 'src/entities/hospital/hospital.entity';
import { PatientService } from '../patient/services/patient.service';
import { HospitalService } from '../hospital/services/hospital.service';
import { NotificationService } from '../notifications/services/notification.service';
import { Notification } from 'src/entities/notifications/notifications.entity';
import { EmrService } from '../emr/services/emr.service';
import { DoctorService } from '../doctor/services/doctor.service';
import { ScheduleService } from '../schedule/services/schedule.service';
import { Walkinpatient } from 'src/entities/walkinpatient/walkinpatient.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Doctor,
      Schedule,
      Appointment,
      Patient,
      User,
      Specialties,
      LogChanges,
      LogHistory,
      Hospital,
      Notification,
      Walkinpatient,
    ]),
  ],
  controllers: [AppointmentController],
  providers: [
    AppointmentService,
    PatientEMRService,
    JwtService,
    PatientService,
    DoctorAssociationService,
    HospitalService,
    NotificationService,
    EmrService,
    DoctorService,
    ScheduleService,
  ],
})
export class AppointmentModule {}
