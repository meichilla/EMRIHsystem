import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Appointment } from 'src/entities/appointment/appointment.entity';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { Schedule } from 'src/entities/schedule/schedule.entity';
import { Specialties } from 'src/entities/specialties/specialties.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: EntityRepository<Schedule>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: EntityRepository<Doctor>,
    @InjectRepository(Specialties)
    private readonly specialtiesRepository: EntityRepository<Specialties>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: EntityRepository<Appointment>,
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(hospitalId: number) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const schedules = await this.scheduleRepository.find(
        {
          $and: [
            { hospitalid: hospitalId },
            {
              scheduledate: {
                $gte: yesterday,
                // $lte: appointment.appodate,
              },
            },
          ],
        },
        {
          orderBy: { scheduleid: 'ASC' }, // or 'DESC' for descending order
        },
      );
      const sessionList = this.sessionList(schedules);
      return sessionList;
    } catch (error) {
      throw error;
    }
  }

  async findOne(scheduleid: number) {
    try {
      const appointment = await this.scheduleRepository.findOne({
        scheduleid: scheduleid,
      });

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  private async sessionList(schedules: Schedule[]) {
    const sessionList = await Promise.all(
      schedules.map(async (schedule) => {
        const doctor = await this.doctorRepository.findOne(
          {
            docid: schedule.docid,
          },
          {
            fields: ['docname', 'specialties', 'hospitalid'],
          },
        );

        const specialization = await this.specialtiesRepository.findOne({
          id: doctor.specialties,
        });

        const appointments = await this.appointmentRepository.find({
          scheduleid: schedule.scheduleid,
        });

        const slotLeft = schedule.nop - appointments.length;
        let sisaSlot;
        if (slotLeft === 0) {
          sisaSlot = 'Fully Booked';
        } else if (slotLeft <= 2) {
          sisaSlot = `${slotLeft} Left`;
        } else {
          sisaSlot = `${slotLeft}`;
        }

        const scheduleSessions = {
          ...schedule,
          slotLeft: sisaSlot,
          docname: doctor.docname,
          specialties: specialization.sname,
        };
        return scheduleSessions;
      }),
    );
    return sessionList;
  }

  async searchSessionByDoctor(hospitalId: number, searchkey: string) {
    try {
      const docIds = await this.getDoctorIds(searchkey);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const schedules = await this.scheduleRepository.find({
        $and: [
          { hospitalid: hospitalId },
          {
            docid: { $in: docIds },
          },
          {
            scheduledate: {
              $gte: yesterday,
              // $lte: appointment.appodate,
            },
          },
        ],
      });

      const sessionList = this.sessionList(schedules);
      return sessionList;
    } catch (error) {
      throw error;
    }
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

  async findAllTodaySessions(hospitalId: number) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const schedules = await this.scheduleRepository.find({
        $and: [
          { hospitalid: hospitalId },
          {
            scheduledate: today,
          },
        ],
      });

      const sessionList = this.sessionList(schedules);
      return sessionList;
    } catch (error) {
      throw error;
    }
  }

  async addSchedule(
    title: string,
    docid: number,
    nop: number,
    date: Date,
    time: string,
    price: string,
    hospitalId: number,
  ) {
    try {
      const schedule: Partial<Schedule> = {
        title: title,
        docid: docid,
        nop: nop,
        scheduledate: date,
        scheduletime: time,
        price: price,
        hospitalid: hospitalId,
      };

      const newSchedule = this.entityManager.create(Schedule, schedule);
      await this.entityManager.persistAndFlush(newSchedule);

      return {
        message: 'Add Schedule successfully',
      };
    } catch (error) {
      console.error('Error registering patient:', error);
      throw new Error(error.message);
    }
  }

  async findAllSessionByDoctor(docid: number, hospitalid: number) {
    try {
      const schedules = await this.scheduleRepository.find(
        {
          $and: [{ docid: docid }, { hospitalid: hospitalid }],
        },
        {
          orderBy: { scheduledate: 'DESC' },
        },
      );
      const sessionList = this.sessionListByDoctorForEMR(schedules);
      return sessionList;
    } catch (error) {
      throw error;
    }
  }

  private async sessionListByDoctorForEMR(schedules: Schedule[]) {
    const doneSessions: Schedule[] = [];
    const inProgressSessions: Schedule[] = [];
    const waitingSessions: Schedule[] = [];

    await Promise.all(
      schedules.map(async (schedule) => {
        const doctor = await this.doctorRepository.findOne(
          {
            docid: schedule.docid,
          },
          {
            fields: ['docname', 'specialties', 'hospitalid'],
          },
        );

        const specialization = await this.specialtiesRepository.findOne({
          id: doctor.specialties,
        });

        const appointments = await this.appointmentRepository.find({
          scheduleid: schedule.scheduleid,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalpatients = appointments.length;
        const scheduleSessions = {
          ...schedule,
          totalpatients: totalpatients,
          docname: doctor.docname,
          specialties: specialization.sname,
          status: '',
        };

        if (today > new Date(schedule.scheduledate)) {
          scheduleSessions.status = 'Done';
          doneSessions.push(scheduleSessions);
        } else if (
          today.toDateString() ===
          new Date(schedule.scheduledate).toDateString()
        ) {
          scheduleSessions.status = 'In Progress';
          inProgressSessions.push(scheduleSessions);
        } else {
          scheduleSessions.status = 'Waiting';
          waitingSessions.push(scheduleSessions);
        }
      }),
    );

    return {
      doneSessions,
      inProgressSessions,
      waitingSessions,
    };
  }
}
