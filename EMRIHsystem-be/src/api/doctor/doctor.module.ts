import { Module } from '@nestjs/common';
import { DoctorsController } from './controllers/doctor.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { DoctorService } from './services/doctor.service';
import { Specialties } from 'src/entities/specialties/specialties.entity';
import { Hospital } from 'src/entities/hospital/hospital.entity';
import { Patient } from 'src/entities/patient/patient.entity';
import { User } from 'src/entities/user/user.entity';
import { DoctorStorageService } from '../blockchain/services/doctorstorage.service';
import { HospitalService } from '../hospital/services/hospital.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Doctor, Specialties, Hospital, Patient, User]),
  ],
  controllers: [DoctorsController],
  providers: [DoctorService, DoctorStorageService, HospitalService],
})
export class DoctorsModule {}
