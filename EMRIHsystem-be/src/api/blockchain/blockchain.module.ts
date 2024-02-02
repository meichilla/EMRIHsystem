import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Patient } from 'src/entities/patient/patient.entity';
import { User } from 'src/entities/user/user.entity';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { Specialties } from 'src/entities/specialties/specialties.entity';
import { PatientEMRService } from './services/patientemr.service';
import { JwtService } from '../jwt/services/jwt.service';
import { DoctorStorageService } from './services/doctorstorage.service';
import { DoctorService } from '../doctor/services/doctor.service';
import { HospitalService } from '../hospital/services/hospital.service';
import { Hospital } from 'src/entities/hospital/hospital.entity';
import { DoctorAssociationService } from './services/doctorassociation.service';
import { Schedule } from 'src/entities/schedule/schedule.entity';
import { Appointment } from 'src/entities/appointment/appointment.entity';
import { LogChanges } from 'src/entities/logchanges/logchanges.entity';
import { PatientService } from '../patient/services/patient.service';
import { NotificationService } from '../notifications/services/notification.service';
import { Notification } from 'src/entities/notifications/notifications.entity';
import { EmrService } from '../emr/services/emr.service';
import { AppointmentService } from '../appointment/services/appointment.service';
import { ScheduleService } from '../schedule/services/schedule.service';
import { Walkinpatient } from 'src/entities/walkinpatient/walkinpatient.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Patient,
      Doctor,
      User,
      Hospital,
      Specialties,
      Schedule,
      Appointment,
      LogChanges,
      Notification,
      Walkinpatient,
    ]),
  ],
  controllers: [],
  providers: [
    PatientEMRService,
    JwtService,
    DoctorStorageService,
    DoctorService,
    HospitalService,
    PatientService,
    DoctorAssociationService,
    NotificationService,
    EmrService,
    AppointmentService,
    ScheduleService,
  ],
})
export class BlockchainModule {}
