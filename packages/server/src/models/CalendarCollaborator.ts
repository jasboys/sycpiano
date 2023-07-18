import type { EventArgs, Rel } from '@mikro-orm/core';
import { AfterCreate, AfterDelete, AfterUpdate, Entity, ManyToOne, Property } from '@mikro-orm/core';
import { transformModelToGoogle, updateCalendar } from '../gapi/calendar.js';
import { Calendar } from './Calendar.js';
import { Collaborator } from './Collaborator.js';

const hook = async (args: EventArgs<CalendarCollaborator>) => {
    const cal = args.entity.calendar;
    const data = await transformModelToGoogle(cal);
    await updateCalendar(args.em, data);
};

@Entity()
export class CalendarCollaborator {

    @Property({ columnType: 'uuid', defaultRaw: `gen_random_uuid()` })
    id!: string;

    @ManyToOne({ entity: () => Calendar, onDelete: 'cascade', primary: true, index: 'calendar_collaborator_calendar_idx' })
    calendar!: Rel<Calendar>;

    @ManyToOne({ entity: () => Collaborator, onDelete: 'cascade', primary: true, index: 'calendar_collaborator_collaborator_idx' })
    collaborator!: Rel<Collaborator>;

    @Property({ nullable: true })
    order?: number;

    @AfterCreate()
    async afterCreate(args: EventArgs<CalendarCollaborator>) {
        await hook(args);
    }

    @AfterUpdate()
    async afterUpdate(args: EventArgs<CalendarCollaborator>) {
        await hook(args);
    }

    @AfterDelete()
    async afterDelete(args: EventArgs<CalendarCollaborator>) {
        await hook(args);
    }
}
