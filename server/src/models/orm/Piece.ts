import { Collection, Entity, Index, ManyToMany, OneToMany, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { Calendar } from './Calendar.js';
import { CalendarPiece } from './CalendarPiece.js';

@Entity()
export class Piece {

  [OptionalProps]?: 'id';

  @PrimaryKey({ columnType: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string;

  @Property({ columnType: 'text', nullable: true })
  piece?: string;

  @Property({ length: 6, nullable: true })
  createdAt?: Date;

  @Property({ length: 6, nullable: true })
  updatedAt?: Date;

  @Property({ columnType: 'text', nullable: true })
  composer?: string;

  @Index({ name: 'piece_search' })
  @Property({ fieldName: '_search', columnType: 'tsvector', nullable: true })
  Search?: unknown;

  @OneToMany({ entity: () => CalendarPiece, mappedBy: cp => cp.piece })
  calendarPieces = new Collection<CalendarPiece>(this);

  @ManyToMany({ entity: () => Calendar, mappedBy: c => c.pieces})
  pieces = new Collection<Piece>(this);

}
