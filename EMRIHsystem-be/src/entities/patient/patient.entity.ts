import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'patient' })
export class Patient {
  @PrimaryKey()
  pid: number;

  @Property({
    type: 'varchar',
    length: 255,
  })
  pemail: string;

  @Property({
    type: 'varchar',
    length: 255,
  })
  pname: string;

  @Property({
    type: 'varchar',
    length: 255,
  })
  ppassword: string;

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
    length: 45,
  })
  pwa: string;

  @Property({
    type: 'varchar',
    length: 255,
  })
  token: string;

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
    length: 255,
  })
  pk: string;
}
