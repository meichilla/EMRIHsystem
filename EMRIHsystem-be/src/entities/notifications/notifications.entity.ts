import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'notifications' })
export class Notification {
  @PrimaryKey()
  id: number;

  @Property()
  patient_id: number;

  @Property({
    type: 'varchar',
    length: 255,
  })
  message: string;

  @Property()
  timestamp: Date;

  @Property()
  is_active: boolean;
}
