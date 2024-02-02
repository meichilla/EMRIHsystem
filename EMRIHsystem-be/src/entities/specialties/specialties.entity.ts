import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'specialties' })
export class Specialties {
  @PrimaryKey()
  @Property({
    type: 'varchar',
    length: 36,
  })
  id: number;

  @Property({
    type: 'varchar',
    length: 50,
  })
  sname: string;
}
