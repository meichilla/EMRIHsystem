import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Patient } from 'src/entities/patient/patient.entity';
import { Walkinpatient } from 'src/entities/walkinpatient/walkinpatient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: EntityRepository<Patient>,
    @InjectRepository(Walkinpatient)
    private readonly walkinPatientRepository: EntityRepository<Walkinpatient>,
    private readonly entityManager: EntityManager,
  ) {}

  async findAllPatient(hospital_id: number) {
    try {
      const patient = await this.walkinPatientRepository.find({
        hospitalid: hospital_id,
      });
      return patient;
    } catch (error) {
      throw error;
    }
  }

  async findPatientByNic(nic: string) {
    try {
      const patient = await this.patientRepository.findOne({
        pnic: nic,
      });
      return patient;
    } catch (error) {
      throw error;
    }
  }

  async findPatient(nic: string) {
    try {
      const patient = await this.patientRepository.findOne({
        pnic: nic,
      });
      return patient;
    } catch (error) {
      throw error;
    }
  }

  async findPatientById(id: number) {
    try {
      const patient = await this.patientRepository.findOne({
        pid: id,
      });
      return patient;
    } catch (error) {
      throw error;
    }
  }

  async findPatientByEmail(email: string) {
    try {
      const patient = await this.patientRepository.findOne({
        pemail: email,
      });
      return patient;
    } catch (error) {
      throw error;
    }
  }
}
