import { Module } from '@nestjs/common';
import { HospitalController } from './controllers/hospital.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HospitalService } from './services/hospital.service';
import { Hospital } from 'src/entities/hospital/hospital.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Hospital])],
  controllers: [HospitalController],
  providers: [HospitalService],
})
export class HospitalModule {}
