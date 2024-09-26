import {
    Collection,
    Entity,
    ManyToMany,
    OneToMany,
    OptionalProps,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { CalendarPiece } from './CalendarPiece.js';
import { Calendar } from './Calendar.js';
import { ProgramPiece } from './ProgramPiece.js';
import { Program } from './Program.js';

@Entity()
export class Piece {
    [OptionalProps]?: 'id';

    @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @Property({ columnType: 'text', nullable: true })
    piece?: string;

    @Property({ columnType: 'text', nullable: true })
    composer?: string;

    @OneToMany({ entity: () => CalendarPiece, mappedBy: (cp) => cp.piece })
    calendarPieces = new Collection<CalendarPiece>(this);

    @ManyToMany({
        entity: () => Calendar,
        pivotEntity: () => CalendarPiece,
        mappedBy: (c) => c.pieces,
        orderBy: { dateTime: 'DESC' },
    })
    calendars = new Collection<Calendar>(this);

    @OneToMany({ entity: () => ProgramPiece, mappedBy: (pp) => pp.piece })
    programPieces = new Collection<ProgramPiece>(this);

    @ManyToMany({
        entity: () => Program,
        pivotEntity: () => ProgramPiece,
        mappedBy: (pp) => pp.pieces,
    })
    programs = new Collection<Program>(this);

    @Property({ persist: false })
    order?: number;
}
