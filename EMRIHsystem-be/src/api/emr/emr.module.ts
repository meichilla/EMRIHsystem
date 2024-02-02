import { Module } from '@nestjs/common';
import { EmrController } from './controllers/emr.controller';
import { Patient } from 'src/entities/patient/patient.entity';
import { User } from 'src/entities/user/user.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EmrService } from './services/emr.service';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { Schedule } from 'src/entities/schedule/schedule.entity';
import { PatientService } from '../patient/services/patient.service';
import { Specialties } from 'src/entities/specialties/specialties.entity';
import { DoctorService } from '../doctor/services/doctor.service';
import { Hospital } from 'src/entities/hospital/hospital.entity';
import { Appointment } from 'src/entities/appointment/appointment.entity';
import { PatientEMRService } from '../blockchain/services/patientemr.service';
import { JwtService } from '../jwt/services/jwt.service';
import { LogChanges } from 'src/entities/logchanges/logchanges.entity';
import { LogHistory } from 'src/entities/loghistory/loghistory.entity';
import { AuthService } from '../auth/services/auth.service';
import { Admin } from 'src/entities/admin/admin.entity';
import { DoctorAssociationService } from '../blockchain/services/doctorassociation.service';
import { HospitalService } from '../hospital/services/hospital.service';
import { Notification } from 'src/entities/notifications/notifications.entity';
import { NotificationService } from '../notifications/services/notification.service';
import { ScheduleService } from '../schedule/services/schedule.service';
import { AppointmentService } from '../appointment/services/appointment.service';
import { Walkinpatient } from 'src/entities/walkinpatient/walkinpatient.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Patient,
      User,
      Doctor,
      Schedule,
      Specialties,
      Hospital,
      Appointment,
      LogChanges,
      LogHistory,
      Admin,
      Notification,
      Walkinpatient,
    ]),
  ],
  controllers: [EmrController],
  providers: [
    EmrService,
    PatientService,
    PatientEMRService,
    DoctorService,
    JwtService,
    AuthService,
    DoctorAssociationService,
    HospitalService,
    NotificationService,
    ScheduleService,
    AppointmentService,
  ],
})
export class EmrModule {}
