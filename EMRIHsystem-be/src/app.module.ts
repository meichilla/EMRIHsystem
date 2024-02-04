import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientModule } from './api/patient/patient.module';
import { ScheduleModule } from './api/schedule/schedule.module';
import { DoctorsModule } from './api/doctor/doctor.module';
import { OtpModule } from './api/otp/otp.module';
import { DbConfigModule } from './config/database/config.module';
import { HospitalModule } from './api/hospital/hospital.module';
import { AuthModule } from './api/auth/auth.module';
import { BlockchainModule } from './api/blockchain/blockchain.module';
import { AppointmentModule } from './api/appointment/appointment.module';
import { SpecialtiesModule } from './api/specialties/specialties.module';
import { EmrModule } from './api/emr/emr.module';
import { NestModule } from '@nestjs/common';
import { MiddlewareConsumer } from '@nestjs/common';
import { AuthMiddleware } from './middleware/auth.middleware';
import { NotificationModule } from './api/notifications/notification.module';
import { RequestMethod } from '@nestjs/common';
import { KTPModule } from './api/ktp-ocr/ktp.module';

@Module({
  imports: [
    // MikroOrmModule.forRoot(mikroOrmConfig),
    DbConfigModule,
    DoctorsModule,
    PatientModule,
    ScheduleModule,
    OtpModule,
    HospitalModule,
    AuthModule,
    BlockchainModule,
    AppointmentModule,
    SpecialtiesModule,
    EmrModule,
    NotificationModule,
    KTPModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path: 'emr/login',
          method: RequestMethod.ALL,
        },
        {
          path: 'emr/validate-login',
          method: RequestMethod.ALL,
        },
        {
          path: '/hospitals',
          method: RequestMethod.ALL,
        },
        {
          path: '/patients/isRegistered',
          method: RequestMethod.ALL,
        },
        {
          path: '/patients/register',
          method: RequestMethod.ALL,
        },
        {
          path: '/patients/register-walkin/:hospitalid',
          method: RequestMethod.ALL,
        },
        {
          path: '/auth/admin',
          method: RequestMethod.ALL,
        },
        {
          path: '/doctors/list',
          method: RequestMethod.ALL,
        },
        {
          path: '/sessions',
          method: RequestMethod.ALL,
        },
        {
          path: '/specialties',
          method: RequestMethod.ALL,
        },
        {
          path: '/doctors/isRegistered/:hospitalid/:nic',
          method: RequestMethod.ALL,
        },
        {
          path: '/doctors/add',
          method: RequestMethod.ALL,
        },
        {
          path: '/emr/sessions',
          method: RequestMethod.ALL,
        },
        {
          path: '/emr/my-patients',
          method: RequestMethod.ALL,
        },
        {
          path: '/emr/get-token',
          method: RequestMethod.ALL,
        },
        {
          path: '/emr/get-emr',
          method: RequestMethod.ALL,
        },
        {
          path: '/emr/soap',
          method: RequestMethod.ALL,
        },
        {
          path: '/emr/doctor/latest-update/:patientid/:walkin',
          method: RequestMethod.ALL,
        },
        {
          path: '/emr/latest-soap/:appointmentId',
          method: RequestMethod.ALL,
        },
      )
      .forRoutes(
        '/emr/patient-emr/:patientid',
        '/emr/update/:patientid',
        '/notif/all/:patientId',
        '/notif/delete/:notificationId',
        '/emr/latest-update/:patientid',
        '/emr/patient/latest-soap/:appointmentId',
      );
  }
}
