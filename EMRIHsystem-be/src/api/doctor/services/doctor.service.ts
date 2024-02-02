import { EntityRepository, LoadStrategy } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { Hospital } from 'src/entities/hospital/hospital.entity';
import { Specialties } from 'src/entities/specialties/specialties.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: EntityRepository<Doctor>,
    @InjectRepository(Specialties)
    private readonly specialtiesRepository: EntityRepository<Specialties>,
    @InjectRepository(Hospital)
    private readonly hospitalRepository: EntityRepository<Hospital>,
  ) {}

  async findAll(hospitalId: number) {
    try {
      const doctors = await this.doctorRepository.find(
        {
          $and: [{ hospitalid: hospitalId }, { is_active: true }],
        },
        {
          orderBy: { docid: 'ASC' }, // or 'DESC' for descending order
        },
      );
      const doctorList = await Promise.all(
        doctors.map(async (doctor) => {
          const specialtyDoctor = await this.specialtiesRepository.findOne(
            doctor.specialties,
            { fields: ['sname'] },
          );
          const hospital = await this.hospitalRepository.findOne(
            doctor.hospitalid,
            { fields: ['hospital_name'] },
          );
          const doctorDetail = {
            ...doctor,
            hospital: hospital.hospital_name,
            specialties: specialtyDoctor.sname,
          };
          return doctorDetail;
        }),
      );
      return doctorList;
    } catch (error) {
      throw error;
    }
  }

  async findDoctorByNic(hospitalid: number, docnic: string) {
    try {
      const doctor = await this.doctorRepository.findOne({
        $and: [
          { hospitalid: hospitalid },
          { docnic: docnic },
          { is_active: true },
        ],
      });
      if (doctor !== null) return true;

      return false;
    } catch (error) {
      throw error;
    }
  }

  async findDoctorByEmail(email: string) {
    try {
      const doctor = await this.doctorRepository.findOne({
        $and: [{ docemail: email }, { is_active: true }],
      });

      return doctor;
    } catch (error) {
      throw error;
    }
  }

  async searchDoctor(hospitalId: number, searchkey: string) {
    try {
      const specialtiesIds = await this.getSpecialtiesIds(searchkey);

      const doctors = await this.doctorRepository.find(
        {
          $and: [{ hospitalid: hospitalId }, { is_active: true }],
          $or: [
            { docname: { $like: `%${searchkey}%` } },
            { specialties: { $in: specialtiesIds } },
          ],
        },
        {
          fields: ['docid', 'docname', 'specialties'],
          strategy: LoadStrategy.SELECT_IN,
        },
      );

      const doctorList = await Promise.all(
        doctors.map(async (doctor) => {
          const specialtyDoctor = await this.specialtiesRepository.findOne(
            doctor.specialties,
            { fields: ['sname'] },
          );
          const doctorDetail = {
            ...doctor,
            specialties: specialtyDoctor.sname,
          };
          return doctorDetail;
        }),
      );

      return doctorList;
    } catch (error) {
      throw error;
    }
  }

  async getSpecialtiesId(searchkey: string): Promise<number> {
    const specialties = await this.specialtiesRepository.findOne(
      {
        sname: { $like: `%${searchkey}%` },
      },
      { fields: ['id'] },
    );

    return specialties.id;
  }

  private async getSpecialtiesIds(searchkey: string): Promise<number[]> {
    const specialties = await this.specialtiesRepository.find(
      {
        sname: { $like: `%${searchkey}%` },
      },
      { fields: ['id'] },
    );

    return specialties.map((s) => s.id);
  }

  async findOne(id: Partial<Doctor>) {
    try {
      const result = await this.doctorRepository.findOne(id, {
        fields: ['docid', 'docname', 'specialties'],
        filters: ['excludeRemovedRow'],
      });

      const id_specialization = result?.specialties;
      const specialization = await this.specialtiesRepository.findOne(
        {
          id: id_specialization,
        },
        { filters: ['excludeRemovedRow'] },
      );
      if (!specialization) throw new Error('Specialization not found');

      if (!result) throw new Error('Doctor not found');

      const doctor = {
        ...result,
        specialties: undefined,
        specialization: specialization.sname,
      };

      return {
        doctor: doctor,
      };
    } catch (error) {
      throw error || new Error('Get Doctor Detail Failed');
    }
  }
}
