import { Module } from '@nestjs/common';
import { ScheduleController } from './controllers/schedule.controller';
import { ScheduleService } from './services/schedule.service';
import { Schedule } from 'src/entities/schedule/schedule.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { Specialties } from 'src/entities/specialties/specialties.entity';
import { Appointment } from 'src/entities/appointment/appointment.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Doctor, Specialties, Schedule, Appointment]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
