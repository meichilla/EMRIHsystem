import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Specialties } from 'src/entities/specialties/specialties.entity';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialties)
    private readonly specialtiesRepository: EntityRepository<Specialties>,
  ) {}

  async findAll() {
    try {
      const schedules = await this.specialtiesRepository.findAll();
      return schedules;
    } catch (error) {
      throw error;
    }
  }
}
