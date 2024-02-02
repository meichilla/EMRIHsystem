import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DoctorService } from '../services/doctor.service';
import { DoctorStorageService } from 'src/api/blockchain/services/doctorstorage.service';

@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly doctorStorageService: DoctorStorageService,
  ) {}

  @Get('/search-doctor/:hospitalid/:searchkey')
  async getDoctorDetails(
    @Param('searchkey') searchkey: string,
    @Param('hospitalid') hospitalid: number,
  ) {
    const doctors = await this.doctorService.searchDoctor(
      hospitalid,
      searchkey,
    );
    return { doctors };
  }

  @Get('/list/:hospitalid')
  async getAllDoctors(@Param('hospitalid') hospitalid: number) {
    const doctors = await this.doctorService.findAll(hospitalid);
    return { doctors };
  }

  @Post('/add')
  async registerDoctor(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') password: string,
    @Body('nic') nic: string,
    @Body('telephone') telephone: string,
    @Body('walletAddress') walletAddress: string,
    @Body('specialties') specialties: string,
    @Body('hospitalId') hospitalId: number,
    @Body('pk') pk: string,
  ) {
    const result = this.doctorStorageService.registerDoctor(
      email,
      name,
      password,
      nic,
      telephone,
      walletAddress,
      specialties,
      hospitalId,
      pk,
    );
    return result;
  }

  @Get('/isRegistered/:hospitalid/:nic')
  async checkDoctorExistByNIC(
    @Param('hospitalid') hospitalid: number,
    @Param('nic') nic: string,
  ): Promise<boolean> {
    const result = this.doctorService.findDoctorByNic(hospitalid, nic);
    // const result = this.ethereumService.getDoctorByNic(nic);
    return result;
  }
}
