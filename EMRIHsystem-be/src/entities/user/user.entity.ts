import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'webuser' })
export class User {
  @PrimaryKey()
  @Property({
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Property({
    type: 'varchar',
    length: 1,
  })
  usertype: string;
}
