import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthService } from './services/auth.service';
import { Patient } from 'src/entities/patient/patient.entity';
import { Admin } from 'src/entities/admin/admin.entity';
import { PatientEMRService } from '../blockchain/services/patientemr.service';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { User } from 'src/entities/user/user.entity';
import { JwtService } from '../jwt/services/jwt.service';
import { LogChanges } from 'src/entities/logchanges/logchanges.entity';
import { LogHistory } from 'src/entities/loghistory/loghistory.entity';
import { PatientService } from '../patient/services/patient.service';
import { DoctorAssociationService } from '../blockchain/services/doctorassociation.service';
import { Schedule } from 'src/entities/schedule/schedule.entity';
import { Appointment } from 'src/entities/appointment/appointment.entity';
import { Hospital } from 'src/entities/hospital/hospital.entity';
import { HospitalService } from '../hospital/services/hospital.service';
import { Notification } from 'src/entities/notifications/notifications.entity';
import { NotificationService } from '../notifications/services/notification.service';
import { EmrService } from '../emr/services/emr.service';
import { Specialties } from 'src/entities/specialties/specialties.entity';
import { DoctorService } from '../doctor/services/doctor.service';
import { AppointmentService } from '../appointment/services/appointment.service';
import { ScheduleService } from '../schedule/services/schedule.service';
import { Walkinpatient } from 'src/entities/walkinpatient/walkinpatient.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Patient,
      Admin,
      Doctor,
      User,
      LogChanges,
      LogHistory,
      Schedule,
      Appointment,
      Hospital,
      Notification,
      Specialties,
      Walkinpatient,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PatientEMRService,
    JwtService,
    PatientService,
    DoctorAssociationService,
    HospitalService,
    NotificationService,
    EmrService,
    DoctorService,
    AppointmentService,
    ScheduleService,
  ],
})
export class AuthModule {}
