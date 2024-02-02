import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Hospital } from 'src/entities/hospital/hospital.entity';

@Injectable()
export class HospitalService {
  constructor(
    @InjectRepository(Hospital)
    private readonly hospitalRepository: EntityRepository<Hospital>,
  ) {}

  async findAll() {
    try {
      const hospitals = await this.hospitalRepository.findAll();
      return hospitals;
    } catch (error) {
      throw error;
    }
  }

  async findOne(hospital_id: number) {
    try {
      const hospital = await this.hospitalRepository.findOne({
        id: hospital_id,
      });
      return hospital.hospital_name;
    } catch (error) {
      throw error;
    }
  }
}
