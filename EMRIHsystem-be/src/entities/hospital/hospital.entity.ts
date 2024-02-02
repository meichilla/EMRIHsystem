import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'hospital' })
export class Hospital {
  @PrimaryKey()
  id: number;

  @Property({
    type: 'varchar',
    length: 100,
  })
  hospital_name: string;
}
