import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'appointment' })
export class Appointment {
  @PrimaryKey()
  appoid: number;

  @Property()
  pid: number;

  @Property()
  apponum?: number;

  @Property()
  scheduleid: number;

  @Property()
  appodate: string;

  @Property()
  hospitalid: number;

  @Property()
  token: string;

  @Property()
  expiresdate: string;

  @Property()
  created_at: Date = new Date();

  @Property()
  status_done: boolean;

  @Property()
  walkin: boolean;
}
