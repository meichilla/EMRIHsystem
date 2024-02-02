import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'doctor' })
export class Doctor {
  @PrimaryKey()
  docid: number;

  @Property({
    type: 'varchar',
    length: 255,
  })
  docname: string;

  @Property({
    type: 'varchar',
    length: 255,
  })
  docpassword: string;

  @Property({
    type: 'varchar',
    length: 255,
  })
  docemail: string;

  @Property({
    type: 'number',
    length: 20,
  })
  specialties: number;

  @Property({
    type: 'varchar',
    length: 20,
  })
  docnic: string;

  @Property({
    type: 'varchar',
    length: 20,
  })
  doctel: string;

  @Property()
  hospitalid: number;

  @Property({
    type: 'varchar',
    length: 45,
  })
  dwa: string;

  @Property({
    type: 'varchar',
    length: 255,
  })
  pk: string;

  @Property()
  is_active: boolean;
}
