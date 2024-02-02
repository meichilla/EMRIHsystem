import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';

@Controller('sessions')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(':hospitalId')
  async getAllSchedules(@Param('hospitalId') hospitalId: number) {
    return this.scheduleService.findAll(hospitalId);
  }

  @Get('/search/:hospitalId/:searchkey')
  async getSessionByDoctor(
    @Param('searchkey') searchkey: string,
    @Param('hospitalId') hospitalId: number,
  ) {
    return this.scheduleService.searchSessionByDoctor(hospitalId, searchkey);
  }

  @Get('/today/:hospitalId')
  async getTodaySessions(@Param('hospitalId') hospitalId: number) {
    return this.scheduleService.findAllTodaySessions(hospitalId);
  }

  @Post('/add-schedule')
  async registerPatient(
    @Body('title') title: string,
    @Body('docid') docid: number,
    @Body('nop') nop: number,
    @Body('date') date: Date,
    @Body('time') time: string,
    @Body('price') price: string,
    @Body('hospitalid') hospitalid: number,
  ) {
    const result = this.scheduleService.addSchedule(
      title,
      docid,
      nop,
      date,
      time,
      price,
      hospitalid,
    );
    return result;
  }
}
