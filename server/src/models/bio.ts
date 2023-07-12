import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Bio {

  @PrimaryKey()
  paragraph!: number;

  @Property({ columnType: 'text' })
  text!: string;

  @Property({ length: 6, nullable: true })
  createdAt?: Date;

  @Property({ length: 6, nullable: true })
  updatedAt?: Date;

}
