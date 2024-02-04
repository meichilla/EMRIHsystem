import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express/multer';
import { KtpController } from './controllers/ktp.controller';
import { KtpService } from './services/ktp.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [KtpController],
  providers: [KtpService],
})
export class KTPModule {}
