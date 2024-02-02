import { Controller, Get } from '@nestjs/common';
import { HospitalService } from '../services/hospital.service';

@Controller('hospitals')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get()
  async getAllHospitals() {
    return this.hospitalService.findAll();
  }
}
