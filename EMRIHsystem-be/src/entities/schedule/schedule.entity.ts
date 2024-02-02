import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'schedule' })
export class Schedule {
  @PrimaryKey()
  scheduleid: number;

  @Property()
  docid?: number;

  @Property({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Property({
    type: 'number',
  })
  scheduledate: Date;

  @Property()
  scheduletime: string;

  @Property()
  nop: number;

  @Property()
  hospitalid: number;

  @Property({
    type: 'varchar',
    length: 45,
  })
  price: string;
}
