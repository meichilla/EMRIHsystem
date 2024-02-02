import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { NotificationController } from './controllers/notification.controllers';
import { NotificationService } from './services/notification.service';
import { Notification } from 'src/entities/notifications/notifications.entity';
import { Doctor } from 'src/entities/doctor/doctor.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Notification, Doctor])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
