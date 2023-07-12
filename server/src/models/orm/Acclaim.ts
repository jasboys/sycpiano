import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Acclaim {

  [OptionalProps]?: 'hasFullDate';

  @PrimaryKey()
  id!: number;

  @Property({ columnType: 'text', nullable: true })
  quote?: string;

  @Property({ columnType: 'text', nullable: true })
  short?: string;

  @Property({ columnType: 'text', nullable: true })
  author?: string;

  @Property({ columnType: 'text', nullable: true })
  shortAuthor?: string;

  @Property({ columnType: 'text', nullable: true })
  website?: string;

  @Property({ default: true })
  hasFullDate: boolean = true;

  @Property({ columnType: 'date', nullable: true })
  date?: string;

}
