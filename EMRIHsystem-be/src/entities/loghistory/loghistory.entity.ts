import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'loghistory' })
export class LogHistory {
  @PrimaryKey()
  id: number;

  @Property({
    type: 'varchar',
    length: 45,
  })
  nic: string;

  @Property()
  hospital_id: number;

  @Property({
    type: 'varchar',
    length: 45,
  })
  description: string;

  @Property({
    type: 'varchar',
    length: 45,
  })
  accessed_by: string;

  @Property()
  timestamp: Date;
}
