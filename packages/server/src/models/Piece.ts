import { Collection, Entity, Index, ManyToMany, OneToMany, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { CalendarPiece } from './CalendarPiece.js';
import { Calendar } from './Calendar.js';

@Entity()
export class Piece {

  [OptionalProps]?: 'id';

  @PrimaryKey({ columnType: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string;

  @Property({ columnType: 'text', nullable: true })
  piece?: string;

  @Property({ columnType: 'text', nullable: true })
  composer?: string;

  @Index({ name: 'piece_search' })
  @Property({ fieldName: '_search', columnType: 'tsvector', nullable: true })
  Search?: unknown;

  @OneToMany({ entity: () => CalendarPiece, mappedBy: cp => cp.piece })
  calendarPieces = new Collection<CalendarPiece>(this);

  @ManyToMany({
    entity: () => Calendar,
    pivotEntity: () => CalendarPiece,
    mappedBy: c => c.pieces,
    orderBy: { 'dateTime': 'DESC' }})
  calendars = new Collection<Calendar>(this);

  @Property({ persist: false })
  order?: number;

}
