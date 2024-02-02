import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Notification } from 'src/entities/notifications/notifications.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationReposistory: EntityRepository<Notification>,
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(patient_id: number) {
    try {
      const notifications = await this.notificationReposistory.find(
        {
          $and: [
            { patient_id: patient_id },
            {
              is_active: true,
            },
          ],
        },
        {
          orderBy: { timestamp: 'DESC' },
        },
      );

      const notificationList = await Promise.all(
        notifications.map(async (notif) => {
          const date = notif.timestamp.toISOString().split('T')[0];
          const time = notif.timestamp.toLocaleTimeString('en-US', {
            hour12: false,
            timeZone: 'Asia/Jakarta',
          });
          const notifDetail = {
            id: notif.id,
            date: date,
            message: notif.message,
            time: time,
          };
          return notifDetail;
        }),
      );

      return notificationList;
    } catch (error) {
      throw error;
    }
  }

  async addNotification(pid: number, message: string) {
    const notification: Partial<Notification> = {
      patient_id: pid,
      message: message,
      timestamp: new Date(),
      is_active: true,
    };

    const newNotif = this.entityManager.create(Notification, notification);
    await this.entityManager.persistAndFlush(newNotif);
  }

  async deleteNotification(notificationId: number) {
    try {
      const existingNotification = await this.notificationReposistory.findOne({
        id: notificationId,
      });

      if (!existingNotification) {
        throw new Error('Notification not found');
      }

      existingNotification.is_active = false;
      await this.entityManager.flush();

      this.findAll(existingNotification.patient_id);
    } catch (error) {
      throw error;
    }
  }
}
