import { defineEntity, p } from '@mikro-orm/core';
import { Calendar } from './Calendar.js';
import { CalendarPiece } from './CalendarPiece.js';
import { Program } from './Program.js';
import { ProgramPiece } from './ProgramPiece.js';

const pieceSchema = defineEntity({
    name: 'Piece',
    properties: {
        id: p.uuid().primary().defaultRaw('gen_random_uuid'),
        piece: p.text().nullable(),
        composer: p.text().nullable(),
        calendarPieces: () => p.oneToMany(CalendarPiece).mappedBy('piece'),
        calendars: () =>
            p
                .manyToMany(Calendar)
                .pivotEntity(() => CalendarPiece)
                .mappedBy('pieces')
                .orderBy({ dateTime: 'DESC' }),
        programPieces: () => p.oneToMany(ProgramPiece).mappedBy('piece'),
        programs: () =>
            p
                .manyToMany(Program)
                .pivotEntity(() => ProgramPiece)
                .mappedBy('pieces'),
        order: p.integer().persist(false).nullable(),
    },
});

export class Piece extends pieceSchema.class {}
pieceSchema.setClass(Piece);

// @Entity()
// export class Piece {
//     [OptionalProps]?: 'id';

//     @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @Property({ columnType: 'text', nullable: true })
//     piece?: string;

//     @Property({ columnType: 'text', nullable: true })
//     composer?: string;

//     @OneToMany({ entity: () => CalendarPiece, mappedBy: (cp) => cp.piece })
//     calendarPieces = new Collection<CalendarPiece>(this);

//     @ManyToMany({
//         entity: () => Calendar,
//         pivotEntity: () => CalendarPiece,
//         mappedBy: (c) => c.pieces,
//         orderBy: { dateTime: 'DESC' },
//     })
//     calendars = new Collection<Calendar>(this);

//     @OneToMany({ entity: () => ProgramPiece, mappedBy: (pp) => pp.piece })
//     programPieces = new Collection<ProgramPiece>(this);

//     @ManyToMany({
//         entity: () => Program,
//         pivotEntity: () => ProgramPiece,
//         mappedBy: (pp) => pp.pieces,
//     })
//     programs = new Collection<Program>(this);

//     @Property({ persist: false })
//     order?: number;
// }
