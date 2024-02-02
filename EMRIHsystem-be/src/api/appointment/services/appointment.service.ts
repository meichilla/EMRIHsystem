import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { DoctorAssociationService } from 'src/api/blockchain/services/doctorassociation.service';
import { JwtService } from 'src/api/jwt/services/jwt.service';
import calculateDaysDifference from 'src/common/utils/calculateDaysDifference';
import { encrypt } from 'src/common/utils/crypto';
import { Appointment } from 'src/entities/appointment/appointment.entity';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { Patient } from 'src/entities/patient/patient.entity';
import { Schedule } from 'src/entities/schedule/schedule.entity';
import { Walkinpatient } from 'src/entities/walkinpatient/walkinpatient.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: EntityRepository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: EntityRepository<Appointment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: EntityRepository<Schedule>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: EntityRepository<Doctor>,
    @InjectRepository(Walkinpatient)
    private readonly walkinPatientRepository: EntityRepository<Walkinpatient>,
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService,
    private readonly doctorAssociationService: DoctorAssociationService,
  ) {}

  async findOne(appoid: number) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        appoid: appoid,
      });

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  async findAllByHospital(hospitalId: number) {
    try {
      const appointments = await this.appointmentRepository.find({
        hospitalid: hospitalId,
      });
      const appointmentList =
        await this.appointmentListAllPatients(appointments);
      return appointmentList;
    } catch (error) {
      throw error;
    }
  }

  private async appointmentListAllPatients(appointments: Appointment[]) {
    const appointmentList = await Promise.all(
      appointments.map(async (appointment) => {
        console.log(appointment);
        const schedule = await this.scheduleRepository.findOne({
          scheduleid: appointment.scheduleid,
        });

        console.log(schedule);

        const patient = await this.patientRepository.findOne({
          pid: appointment.appoid,
        });
        console.log(patient);

        const doctor = await this.doctorRepository.findOne({
          docid: schedule.docid,
        });

        console.log(doctor);

        const appointmentDetail = {
          patientName: patient.pname,
          patientId: patient.pid,
          noRM: patient.no_rm,
          appointmentNumber: appointment.apponum,
          sessionTitle: schedule.title,
          doctor: doctor.docname,
          scheduleDate: schedule.scheduledate,
          scheduleTime: schedule.scheduletime,
          statusDone: appointment.status_done,
        };
        return appointmentDetail;
      }),
    );
    return appointmentList;
  }

  async findAll(hospitalId: number, pid: number) {
    try {
      const appointments = await this.appointmentRepository.find({
        $and: [{ pid: pid }, { hospitalid: hospitalId }],
      });
      const appointmentList = await this.appointmentList(appointments);
      return appointmentList;
    } catch (error) {
      throw error;
    }
  }

  async findAllUpcomingBooking(hospitalId: number, pid: number) {
    try {
      const appointments = await this.appointmentRepository.find({
        $and: [
          { pid: pid },
          { hospitalid: hospitalId },
          { status_done: false },
        ],
      });
      const appointmentList = await this.appointmentList(appointments);
      return appointmentList;
    } catch (error) {
      throw error;
    }
  }

  async findAllNewBooking(hospitalId: number, pid: number) {
    try {
      const today = new Date();
      const date = new Date(today);
      // Set the time part to zero
      date.setHours(0, 0, 0, 0);

      const appointments = await this.appointmentRepository.find({
        $and: [{ pid: pid }, { hospitalid: hospitalId }, { created_at: date }],
      });
      return appointments.length;
    } catch (error) {
      throw error;
    }
  }

  private async appointmentList(appointments: Appointment[]) {
    const appointmentList = await Promise.all(
      appointments.map(async (appointment) => {
        const schedule = await this.scheduleRepository.findOne({
          scheduleid: appointment.scheduleid,
        });

        const doctor = await this.doctorRepository.findOne({
          docid: schedule.docid,
        });

        const appointmentDetail = {
          appointmentNumber: appointment.apponum,
          sessionTitle: schedule.title,
          doctor: doctor.docname,
          scheduleDate: schedule.scheduledate,
          scheduleTime: schedule.scheduletime,
          statusDone: appointment.status_done,
        };
        return appointmentDetail;
      }),
    );
    return appointmentList;
  }

  private async getDoctorIds(searchkey: string): Promise<number[]> {
    const specialties = await this.doctorRepository.find(
      {
        docname: { $like: `%${searchkey}%` },
      },
      { fields: ['docid'] },
    );

    return specialties.map((s) => s.docid);
  }

  async generateToken(payloadValue: string, scheduleDate: Date) {
    const payload = { payloadValue };

    const expiresIn = `${calculateDaysDifference(scheduleDate)}d`;

    const token = this.jwtService.generateTokenWithExpiration(
      payload,
      expiresIn,
    );
    return token;
  }

  async createAppointment(decryptedData: string) {
    try {
      const dataDetails = JSON.parse(decryptedData);
      console.log('data details', dataDetails);
      const pid = dataDetails['pid'];
      const scheduleId = dataDetails['scheduleId'];

      const patient = await this.patientRepository.findOne({
        pid: pid,
      });

      const schedule = await this.scheduleRepository.findOne({
        scheduleid: scheduleId,
      });

      const appointments = await this.appointmentRepository.find({
        scheduleid: scheduleId,
      });

      const scheduleDate = new Date(schedule.scheduledate);
      scheduleDate.setUTCHours(0, 0, 0, 0);
      console.log(scheduleDate);

      const expiresDate = new Date(scheduleDate);
      expiresDate.setDate(expiresDate.getDate() + 1);
      console.log(expiresDate);

      const apponum = appointments.length + 1;
      const payload = encrypt(
        JSON.stringify({
          pid: patient.pid,
          scheduleid: scheduleId,
        }),
      );
      const token = `${await this.generateToken(payload, expiresDate)}`;

      console.log(token);

      const appointmentDetail: Partial<Appointment> = {
        pid: pid,
        scheduleid: scheduleId,
        hospitalid: schedule.hospitalid,
        appodate: scheduleDate.toISOString().split('T')[0],
        apponum: apponum,
        token: token,
        expiresdate: expiresDate.toISOString(),
        status_done: false,
        walkin: false,
      };

      const addAppointment = this.entityManager.create(
        Appointment,
        appointmentDetail,
      );
      await this.entityManager.persistAndFlush(addAppointment);

      const appointment = await this.appointmentRepository.findOne({
        $and: [{ scheduleid: schedule.scheduleid }, { pid: patient.pid }],
      });

      const result =
        await this.doctorAssociationService.associateDoctorWithPatient(
          appointment.appoid,
          token,
          scheduleDate.toISOString().split('T')[0],
        );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async createWalkinAppointment(decryptedData: string) {
    try {
      const dataDetails = JSON.parse(decryptedData);
      console.log('data details', dataDetails);
      const pnic = dataDetails['pnic'];
      const scheduleId = dataDetails['scheduleId'];
      let registeredPatient = true;

      let patient: any = await this.patientRepository.findOne({
        pnic: pnic,
      });

      if (!patient) {
        registeredPatient = false;
        patient = await this.walkinPatientRepository.findOne({
          pnic: pnic,
        });
      }

      const schedule = await this.scheduleRepository.findOne({
        scheduleid: scheduleId,
      });

      const appointments = await this.appointmentRepository.find({
        scheduleid: scheduleId,
      });

      const scheduleDate = new Date(schedule.scheduledate);
      scheduleDate.setUTCHours(0, 0, 0, 0);
      console.log(scheduleDate);

      const expiresDate = new Date(scheduleDate);
      expiresDate.setDate(expiresDate.getDate() + 1);
      console.log(expiresDate);

      const apponum = appointments.length + 1;
      const payload = encrypt(
        JSON.stringify({
          pid: patient.pid,
          scheduleid: scheduleId,
        }),
      );
      const token = `${await this.generateToken(payload, expiresDate)}`;

      console.log(token);

      const appointmentDetail: Partial<Appointment> = {
        pid: patient.pid,
        scheduleid: scheduleId,
        hospitalid: schedule.hospitalid,
        appodate: scheduleDate.toISOString().split('T')[0],
        apponum: apponum,
        token: token,
        expiresdate: expiresDate.toISOString(),
        status_done: false,
        walkin: true,
      };

      const addAppointment = this.entityManager.create(
        Appointment,
        appointmentDetail,
      );
      await this.entityManager.persistAndFlush(addAppointment);

      const appointment = await this.appointmentRepository.findOne({
        $and: [{ scheduleid: schedule.scheduleid }, { pid: patient.pid }],
      });

      let result;
      if (registeredPatient) {
        result = await this.doctorAssociationService.associateDoctorWithPatient(
          appointment.appoid,
          token,
          scheduleDate.toISOString().split('T')[0],
        );
      } else {
        result =
          await this.doctorAssociationService.associateDoctorWithPatientWalkin(
            appointment.appoid,
            token,
            scheduleDate.toISOString().split('T')[0],
          );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async checkAppointment(pid: number, scheduleId: number) {
    try {
      const appointments = await this.appointmentRepository.findOne({
        $and: [{ pid: pid }, { scheduleid: scheduleId }],
      });

      let message;
      if (appointments) {
        message = 'Patient already booked this session';
      } else {
        message = 'Patient can booked this session';
      }

      return {
        message: message,
      };
    } catch (error) {
      throw error;
    }
  }

  async checkAppointmentForWalkin(pnic: string, scheduleId: number) {
    try {
      const patient = await this.patientRepository.findOne({
        pnic: pnic,
      });

      const patientWalkin = await this.walkinPatientRepository.findOne({
        pnic: pnic,
      });

      let message;
      if (patient && !patientWalkin) {
        const appointments = await this.appointmentRepository.findOne({
          $and: [{ pid: patient.pid }, { scheduleid: scheduleId }],
        });

        if (appointments) {
          message = 'Patient already booked this session';
        } else {
          message = 'Patient can booked this session';
        }
      } else if (patient && patientWalkin) {
        const appointments = await this.appointmentRepository.findOne({
          $and: [{ pid: patient.pid }, { scheduleid: scheduleId }],
        });

        if (appointments) {
          message = 'Patient already booked this session';
        } else {
          const appointments = await this.appointmentRepository.findOne({
            $and: [
              { pid: patientWalkin.pid },
              { scheduleid: scheduleId },
              { walkin: true },
            ],
          });

          if (appointments) {
            message = 'Patient already booked this session';
          } else {
            message = 'Patient can booked this session';
          }
        }
      } else {
        const appointments = await this.appointmentRepository.findOne({
          $and: [
            { pid: patientWalkin.pid },
            { scheduleid: scheduleId },
            { walkin: true },
          ],
        });

        if (appointments) {
          message = 'Patient already booked this session';
        } else {
          message = 'Patient can booked this session';
        }
      }

      return {
        message: message,
      };
    } catch (error) {
      throw error;
    }
  }
}
