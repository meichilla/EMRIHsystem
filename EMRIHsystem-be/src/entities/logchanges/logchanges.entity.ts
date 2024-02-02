import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'logchanges' })
export class LogChanges {
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
  changed_by: string;

  @Property({
    type: 'varchar',
    length: 45,
  })
  type: string;

  @Property()
  timestamp: Date;

  @Property({
    type: 'varchar',
    length: 255,
  })
  field: string;

  @Property()
  previous_value_id: number;

  @Property()
  value: string;
}
