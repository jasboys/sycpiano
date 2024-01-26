import type { EventArgs, Rel } from '@mikro-orm/core';
import {
    AfterCreate,
    AfterDelete,
    AfterUpdate,
    Entity,
    ManyToOne,
    Property,
} from '@mikro-orm/core';
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

@Entity()
export class CalendarPiece {
    @Property({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @ManyToOne({
        entity: () => Calendar,
        primary: true,
        index: 'calendar_piece_calendar_idx',
    })
    calendar!: Rel<Calendar>;

    @ManyToOne({
        entity: () => Piece,
        primary: true,
        index: 'calendar_piece_piece_idx',
    })
    piece!: Rel<Piece>;

    @Property({ nullable: true })
    order?: number;

    @AfterCreate()
    async afterCreate(args: EventArgs<CalendarPiece>) {
        await hook(args);
    }

    @AfterUpdate()
    async afterUpdate(args: EventArgs<CalendarPiece>) {
        await hook(args);
    }

    @AfterDelete()
    async afterDelete(args: EventArgs<CalendarPiece>) {
        await hook(args);
    }
}
