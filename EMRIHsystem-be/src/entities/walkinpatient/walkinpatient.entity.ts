import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'patientwalkin' })
export class Walkinpatient {
  @PrimaryKey()
  pid: number;

  @Property({
    type: 'varchar',
    length: 255,
  })
  pname: string;

  @Property({
    type: 'varchar',
    length: 20,
  })
  pnic: string;

  @Property({
    type: 'varchar',
    length: 255,
  })
  paddress: string;

  @Property()
  pdob: Date;

  @Property({
    type: 'varchar',
    length: 20,
  })
  ptel: string;

  @Property({
    type: 'varchar',
    length: 255,
  })
  url_ktp: string;

  @Property({
    type: 'varchar',
    length: 255,
  })
  no_rm: string;

  @Property({
    type: 'varchar',
    length: 10,
  })
  gender: string;

  @Property()
  hospitalid: number;
}
