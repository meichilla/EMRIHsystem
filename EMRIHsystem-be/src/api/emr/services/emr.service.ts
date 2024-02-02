import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Appointment } from 'src/entities/appointment/appointment.entity';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { Patient } from 'src/entities/patient/patient.entity';
import { Schedule } from 'src/entities/schedule/schedule.entity';
import { Specialties } from 'src/entities/specialties/specialties.entity';
import { User } from 'src/entities/user/user.entity';
import { Walkinpatient } from 'src/entities/walkinpatient/walkinpatient.entity';

@Injectable()
export class EmrService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: EntityRepository<Schedule>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: EntityRepository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: EntityRepository<Patient>,
    @InjectRepository(Walkinpatient)
    private readonly walkinPatientRepository: EntityRepository<Walkinpatient>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: EntityRepository<Appointment>,
    @InjectRepository(Specialties)
    private readonly specialtiesRepository: EntityRepository<Specialties>,
    private readonly entityManager: EntityManager,
  ) {}

  async validateLogin(email: string) {
    try {
      const user = await this.userRepository.findOne({ email: email });
      if (!user) {
        return {
          error: 'User Not Found',
        };
      }

      let password;
      if (user.usertype === 'p') {
        const userDetail = await this.patientRepository.findOne({
          pemail: email,
        });
        password = userDetail.ppassword;
      } else if (user.usertype === 'd') {
        const userDetail = await this.doctorRepository.findOne({
          docemail: email,
        });
        password = userDetail.docpassword;
      }

      return {
        userType: user.usertype,
        password: password,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPatientNic(email: string) {
    try {
      const patient = await this.patientRepository.findOne(
        {
          pemail: email,
        },
        { fields: ['pnic'] },
      );
      return patient.pnic;
    } catch (error) {
      throw error;
    }
  }

  async getDoctorByEmail(email: string) {
    try {
      const doctor = await this.doctorRepository.findOne({
        $and: [{ docemail: email }, { is_active: true }],
      });

      const specialties = await this.specialtiesRepository.findOne({
        id: doctor.specialties,
      });

      const doctorDetail = {
        ...doctor,
        specialties: specialties.sname,
      };

      return doctorDetail;
    } catch (error) {
      throw error;
    }
  }

  async getDoctorByEmailandHospital(hospitalid: number, email: string) {
    try {
      const doctor = await this.doctorRepository.findOne({
        $and: [
          { docemail: email },
          { hospitalid: hospitalid },
          { is_active: true },
        ],
      });

      const specialties = await this.specialtiesRepository.findOne({
        id: doctor.specialties,
      });

      const doctorDetail = {
        ...doctor,
        specialties: specialties.sname,
      };

      return doctorDetail;
    } catch (error) {
      throw error;
    }
  }

  async getMyPatients(docid: number, hospitalid: number) {
    try {
      const today = new Date();
      const year = today.toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
      });
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');

      const indonesiaDate = `${year}-${month}-${day}`;

      const scheduleIds = await this.getScheduleId(docid, hospitalid);
      const appointments = await this.appointmentRepository.find(
        {
          $and: [
            { scheduleid: { $in: scheduleIds } },
            { appodate: indonesiaDate },
          ],
        },
        {
          orderBy: { appodate: 'DESC', scheduleid: 'ASC', apponum: 'ASC' },
        },
      );

      const patients = await Promise.all(
        appointments.map(async (appointment) => {
          let patient;
          if (appointment.walkin === false) {
            patient = await this.patientRepository.findOne({
              pid: appointment.pid,
            });
          } else {
            patient = await this.walkinPatientRepository.findOne({
              pid: appointment.pid,
            });
          }

          const schedule = await this.scheduleRepository.findOne({
            scheduleid: appointment.scheduleid,
          });

          const patientDetail = {
            pname: patient.pname,
            paddress: patient.paddress,
            pdob: patient.pdob,
            pid: patient.pid,
            pemail: patient.pemail ?? '',
            ptel: patient.ptel,
            session: schedule.title,
            sessionid: schedule.scheduleid,
            apponumber: appointment.apponum,
            appoid: appointment.appoid,
            status: appointment.status_done,
            walkin: appointment.walkin,
          };

          return patientDetail;
        }),
      );
      return patients;
    } catch (error) {
      throw error;
    }
  }

  private async getScheduleId(
    docid: number,
    hospitalid: number,
  ): Promise<number[]> {
    const schedules = await this.scheduleRepository.find(
      {
        $and: [{ docid: docid }, { hospitalid: hospitalid }],
      },
      { fields: ['scheduleid'] },
    );

    return schedules.map((s) => s.scheduleid);
  }

  private async getPatientId(
    hospitalid: number,
    scheduleIds: number[],
  ): Promise<number[]> {
    const appointment = await this.appointmentRepository.find(
      {
        $or: [{ hospitalid: hospitalid }, { scheduleid: { $in: scheduleIds } }],
      },
      { fields: ['pid'] },
    );

    return appointment.map((s) => s.pid);
  }
}
