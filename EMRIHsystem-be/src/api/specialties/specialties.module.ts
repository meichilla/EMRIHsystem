import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Specialties } from 'src/entities/specialties/specialties.entity';
import { SpecialtiesController } from './controllers/specialties.controller';
import { SpecialtiesService } from './services/specialties.service';

@Module({
  imports: [MikroOrmModule.forFeature([Specialties])],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService],
})
export class SpecialtiesModule {}
