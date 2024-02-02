import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'admin' })
export class Admin {
  @PrimaryKey()
  username: string;

  @Property()
  email: string;

  @Property()
  password: string;
}
