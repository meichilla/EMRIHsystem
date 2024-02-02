import { Controller, Get } from '@nestjs/common';
import { SpecialtiesService } from '../services/specialties.service';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  async getAllSchedules() {
    return this.specialtiesService.findAll();
  }
}
