import type { EventArgs } from '@mikro-orm/core';
import { defineEntity, p } from '@mikro-orm/core';
import { transformModelToGoogle, updateCalendar } from '../gapi/calendar.js';
import { Calendar } from './Calendar.js';
import { Piece } from './Piece.js';

const hook = async (args: EventArgs<CalendarPiece>) => {
    const calendarId = args.entity.calendar.id;
    const cal = await args.em.findOneOrFail(Calendar, calendarId, {
        populate: ['pieces', 'collaborators'],
    });
    const data = transformModelToGoogle(cal);
    await updateCalendar(args.em, data);
};

const calendarPieceSchema = defineEntity({
    name: 'CalendarPiece',
    properties: {
        id: p.uuid().defaultRaw('gen_random_uuid'),
        calendar: () =>
            p
                .manyToOne(Calendar)
                .primary()
                .index('calendar_piece_calendar_idx'),
        piece: () =>
            p.manyToOne(Piece).primary().index('calendar_piece_piece_idx'),
        order: p.integer().nullable(),
    },
});

export class CalendarPiece extends calendarPieceSchema.class {}

calendarPieceSchema.setClass(CalendarPiece);

calendarPieceSchema.addHook(
    'afterCreate',
    async (args: EventArgs<CalendarPiece>) => {
        await hook(args);
    },
);

calendarPieceSchema.addHook(
    'afterUpdate',
    async (args: EventArgs<CalendarPiece>) => {
        await hook(args);
    },
);

calendarPieceSchema.addHook(
    'afterDelete',
    async (args: EventArgs<CalendarPiece>) => {
        await hook(args);
    },
);

// @Entity()
// export class CalendarPiece {
//     @Property({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @ManyToOne({
//         entity: () => Calendar,
//         primary: true,
//         index: 'calendar_piece_calendar_idx',
//     })
//     calendar!: Rel<Calendar>;

//     @ManyToOne({
//         entity: () => Piece,
//         primary: true,
//         index: 'calendar_piece_piece_idx',
//     })
//     piece!: Rel<Piece>;

//     @Property({ nullable: true })
//     order?: number;

//     @AfterCreate()
//     async afterCreate(args: EventArgs<CalendarPiece>) {
//         await hook(args);
//     }

//     @AfterUpdate()
//     async afterUpdate(args: EventArgs<CalendarPiece>) {
//         await hook(args);
//     }

//     @AfterDelete()
//     async afterDelete(args: EventArgs<CalendarPiece>) {
//         await hook(args);
//     }
// }
