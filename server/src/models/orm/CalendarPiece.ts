import type { EventArgs, Rel } from '@mikro-orm/core';
import { AfterCreate, AfterDelete, AfterUpdate, Entity, ManyToOne, Property } from '@mikro-orm/core';
import { transformModelToGoogle, updateCalendar } from '../../gapi/calendar.js';
import { Calendar } from './Calendar.js';
import { Piece } from './Piece.js';

// const hook = async (args: EventArgs<CalendarPiece>) => {
//     const cal = args.entity.calendar;
//     const data = await transformModelToGoogle(cal);
//     await updateCalendar(data);
// };
const testfunc = (ina: any) => {
    console.log(ina);
}

@Entity()
export class CalendarPiece {

    @ManyToOne({ entity: () => Calendar, onDelete: 'cascade', primary: true, index: 'calendar_piece_calendar_idx' })
    calendar!: Rel<Calendar>;

    @ManyToOne({ entity: () => Piece, onDelete: 'cascade', primary: true, index: 'calendar_piece_piece_idx' })
    piece!: Rel<Piece>;

    @Property({ length: 6, nullable: true })
    createdAt?: Date;

    @Property({ length: 6, nullable: true })
    updatedAt?: Date;

    @Property({ nullable: true })
    order?: number;

    @AfterCreate()
    afterCreate = async (args: EventArgs<CalendarPiece>) => {
        try {
        // const cal = args.entity.calendar;
        transformModelToGoogle();
        } catch (e) {
        }
        // await updateCalendar(data);
    }

    // @AfterUpdate()
    // async afterUpdate(args: EventArgs<CalendarPiece>) {
    //     await hook(args);
    // }

    // @AfterDelete()
    // async afterDelete(args: EventArgs<CalendarPiece>) {
    //     await hook(args);
    // }
}
