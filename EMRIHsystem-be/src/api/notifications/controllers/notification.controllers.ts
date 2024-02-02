import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { AuthMiddleware } from 'src/middleware/auth.middleware';

@Controller('notif')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/all/:patientId')
  @UseGuards(AuthMiddleware)
  async getAllNotification(@Param('patientId') patient_id: number) {
    return await this.notificationService.findAll(patient_id);
  }

  @Get('/delete/:notificationId')
  @UseGuards(AuthMiddleware)
  async getTodayNotif(@Param('notificationId') notificationId: number) {
    return this.notificationService.deleteNotification(notificationId);
  }
}
