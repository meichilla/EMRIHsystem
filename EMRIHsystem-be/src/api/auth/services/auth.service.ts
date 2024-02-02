import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Admin } from 'src/entities/admin/admin.entity';
import { Patient } from 'src/entities/patient/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: EntityRepository<Patient>,
    @InjectRepository(Admin)
    private readonly adminRepository: EntityRepository<Admin>,
  ) {}

  async findPatient(email: string) {
    try {
      const patient = await this.patientRepository.findOne({
        $and: [{ pemail: email }],
      });
      if (!patient) throw 'PATIENT NOT FOUND';
      return patient;
    } catch (error) {
      throw new Error(`Error auth login : ${error.message}`);
    }
  }

  async findAdmin(username: string) {
    try {
      const admin = await this.adminRepository.findOne({
        username: username,
      });
      if (!admin) throw 'ADMIN NOT FOUND';
      return admin;
    } catch (error) {
      throw new Error(`Error auth login : ${error.message}`);
    }
  }
}
